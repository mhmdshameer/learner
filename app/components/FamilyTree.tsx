"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useEffect } from "react";
import MemberCard from "./card"; // your existing component

/* -------------------- Types -------------------- */

export type RawMember = {
  _id: any; // could be ObjectId or string or populated object
  name?: string;
  imageUrl?: string;
  relation?: string; // 'self' | 'father' | 'mother' | 'wife' | ...
  displayRelation?: string;
  linkedTo?: any | null;
  // might be ObjectIds or full objects (if populated) or strings
  fathers?: any[];
  mothers?: any[];
  wives?: any[];
  husbands?: any[];
  sons?: any[];
  daughters?: any[];
};

export type MemberNode = {
  _id: string;
  name: string;
  imageUrl?: string;
  relation: string;
  displayRelation?: string;
  linkedTo?: string | null;
  fathers: string[]; // ids
  mothers: string[]; // ids
  wives: string[]; // ids
  husbands: string[]; // ids
  sons: string[]; // ids
  daughters: string[]; // ids
};

/* -------------------- Helpers -------------------- */

/**
 * Safely get ID string from raw value (ObjectId, string, or populated doc)
 */
function idToString(id: any): string {
  if (!id && id !== 0) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object") {
    // Mongoose ObjectId has .toString() and .toHexString()
    if (typeof (id as any).toString === "function") {
      return (id as any).toString();
    }
    if ((id as any)._id) return idToString((id as any)._id);
  }
  return String(id);
}

/**
 * Normalize raw members array (coming from the backend) into MemberNode[]
 * - ensures all ids are strings
 * - ensures relationship arrays are arrays of ID strings
 */
export function normalizeMembers(raw: RawMember[]): MemberNode[] {
  return (raw || []).map((r) => {
    const _id = idToString(r._id);

    const normArr = (arr?: any[]) => (arr || []).map((x) => idToString(x)).filter(Boolean);

    return {
      _id,
      name: r.name || "Unknown",
      imageUrl: r.imageUrl,
      relation: (r.relation || "").toLowerCase() || "self",
      displayRelation: r.displayRelation,
      linkedTo: r.linkedTo != null ? idToString(r.linkedTo) : null,
      fathers: normArr(r.fathers),
      mothers: normArr(r.mothers),
      wives: normArr(r.wives),
      husbands: normArr(r.husbands),
      sons: normArr(r.sons),
      daughters: normArr(r.daughters),
    } as MemberNode;
  });
}

/**
 * Build family map for O(1) lookups: id -> MemberNode
 */
export function buildFamilyMap(members: MemberNode[]): Record<string, MemberNode> {
  const map: Record<string, MemberNode> = {};
  members.forEach((m) => {
    map[m._id] = m;
  });
  return map;
}

/**
 * Find top-most ancestor (no fathers and no mothers).
 * If none, prefer node with relation 'self', otherwise return first member.
 */
export function findTopAncestor(members: MemberNode[]): MemberNode | null {
  if (!members || members.length === 0) return null;
  const noParents = members.filter((m) => m.fathers.length === 0 && m.mothers.length === 0);
  if (noParents.length > 0) return noParents[0];
  const selfNode = members.find((m) => m.relation === "self");
  if (selfNode) return selfNode;
  return members[0];
}

/* -------------------- UI helpers -------------------- */

function capitalize(s?: string) {
  if (!s) return "";
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Render a person with their spouse(s) beside them.
 * spouse IDs are resolved via familyMap.
 */
function PersonWithSpouse({
  person,
  familyMap,
}: {
  person: MemberNode;
  familyMap: Record<string, MemberNode>;
}) {
  // Start with explicitly linked spouses
  const spouseIds = new Set<string>([
    ...((person.wives || [])),
    ...((person.husbands || [])),
  ]);

  // Legacy fallback: find spouse members that point to this person via linkedTo with spouse relations
  for (const m of Object.values(familyMap)) {
    if (m.linkedTo === person._id && (m.relation === 'wife' || m.relation === 'husband')) {
      spouseIds.add(m._id);
    }
  }

  // Derive spouses via shared children if not explicitly linked
  // Find children of this person
  const children = Object.values(familyMap).filter((m) => {
    return (m.fathers && m.fathers.includes(person._id)) || (m.mothers && m.mothers.includes(person._id));
  });
  for (const child of children) {
    // If this person is a father, pair with child's mothers
    if (child.mothers && child.mothers.length > 0 && person._id && (child.fathers || []).includes(person._id)) {
      for (const mid of child.mothers) spouseIds.add(mid);
    }
    // If this person is a mother, pair with child's fathers
    if (child.fathers && child.fathers.length > 0 && person._id && (child.mothers || []).includes(person._id)) {
      for (const fid of child.fathers) spouseIds.add(fid);
    }
  }

  const spouses: MemberNode[] = Array.from(spouseIds)
    .map((id) => familyMap[id])
    .filter(Boolean) as MemberNode[];

  const relationLabel = person.relation === "self" ? "Me" : person.displayRelation?.trim() || capitalize(person.relation);

  return (
    <div className="flex items-center gap-4">
      <MemberCard
        relation={relationLabel}
        name={person.name}
        imageUrl={person.imageUrl}
        memberId={person._id}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      {spouses.map((sp) => (
        <React.Fragment key={sp._id}>
          <div className="h-0.5 w-6 bg-gray-300" />
          <MemberCard
            relation={sp.displayRelation?.trim() || capitalize(sp.relation)}
            name={sp.name}
            imageUrl={sp.imageUrl}
            memberId={sp._id}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

/* -------------------- Main Recursive Component -------------------- */

/**
 * TreeNode renders a family unit around `currentId` .
 * visitedSet prevents infinite cycles - a node already in the current ancestor/descendant chain won't be re-rendered.
 */
export function TreeNode({
  currentId,
  familyMap,
  visited = new Set<string>(),
  maxDepth = 50, // safety guard
  showParents = true,
}: {
  currentId: string;
  familyMap: Record<string, MemberNode>;
  visited?: Set<string>;
  maxDepth?: number;
  showParents?: boolean;
}) {
  if (!familyMap) return null;
  if (!currentId) return null;

  const current = familyMap[currentId];
  if (!current) {
    console.warn("[TreeNode] missing member for id:", currentId);
    return null;
  }

  if (visited.has(currentId)) {
    // already rendered up the chain — stop to avoid cycles
    return null;
  }
  if (maxDepth <= 0) return null;

  // create new visited set for recursive children/parents to avoid affecting siblings
  const nextVisited = new Set(visited);
  nextVisited.add(currentId);

  // resolve parents (prefer explicit links on the child)
  const fatherNodeExplicit = current.fathers?.length ? familyMap[current.fathers[0]] : undefined;
  const motherNodeExplicit = current.mothers?.length ? familyMap[current.mothers[0]] : undefined;

  // infer missing parent from the other parent's spouse list (helps when you added a wife to father but didn't set child.mothers)
  let fatherNode = fatherNodeExplicit;
  let motherNode = motherNodeExplicit;
  if (!motherNode && fatherNodeExplicit) {
    const spouseIds = new Set<string>([...(fatherNodeExplicit.wives || []), ...(fatherNodeExplicit.husbands || [])]);
    // Legacy: also check members that link to father as wife/husband
    for (const m of Object.values(familyMap)) {
      if (m.linkedTo === fatherNodeExplicit._id && (m.relation === 'wife' || m.relation === 'husband')) {
        spouseIds.add(m._id);
      }
    }
    const inferred = Array.from(spouseIds).map((id) => familyMap[id]).find(Boolean);
    if (inferred) motherNode = inferred;
  }
  if (!fatherNode && motherNodeExplicit) {
    const spouseIds = new Set<string>([...(motherNodeExplicit.wives || []), ...(motherNodeExplicit.husbands || [])]);
    for (const m of Object.values(familyMap)) {
      if (m.linkedTo === motherNodeExplicit._id && (m.relation === 'wife' || m.relation === 'husband')) {
        spouseIds.add(m._id);
      }
    }
    const inferred = Array.from(spouseIds).map((id) => familyMap[id]).find(Boolean);
    if (inferred) fatherNode = inferred;
  }

  const parents = [fatherNode, motherNode].filter(Boolean) as MemberNode[];

  // children of the current person (derive by reverse lookup)
  const ownChildren = Object.values(familyMap).filter((m) => {
    return (m.fathers && m.fathers.includes(currentId)) || (m.mothers && m.mothers.includes(currentId));
  }) as MemberNode[];

  // siblings row: children of the parents couple (include current among them)
  const siblings: MemberNode[] = (() => {
    if (!showParents || parents.length === 0) return [];
    const parentIds = new Set<string>();
    if (fatherNode?._id) parentIds.add(fatherNode._id);
    if (motherNode?._id) parentIds.add(motherNode._id);
    return Object.values(familyMap).filter((m) => {
      const isChildOfFather = m.fathers?.some((id) => parentIds.has(id));
      const isChildOfMother = m.mothers?.some((id) => parentIds.has(id));
      return isChildOfFather || isChildOfMother;
    }) as MemberNode[];
  })();

  // Render pattern:
  // - parents row (parents rendered recursively)
  // - current person + spouse(s)
  // - children row: each child is a family unit (executes same component recursively)
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Parents - render as a couple row above (only when showParents is true) */}
      {showParents && parents.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-6">
            {fatherNode && (
              <MemberCard
                relation={fatherNode.displayRelation?.trim() || capitalize(fatherNode.relation)}
                name={fatherNode.name}
                imageUrl={fatherNode.imageUrl}
                memberId={fatherNode._id}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
            {fatherNode && motherNode && <div className="h-0.5 w-10 bg-gray-300" />}
            {motherNode && (
              <MemberCard
                relation={motherNode.displayRelation?.trim() || capitalize(motherNode.relation)}
                name={motherNode.name}
                imageUrl={motherNode.imageUrl}
                memberId={motherNode._id}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
          </div>
          {/* vertical connector down to siblings row */}
          <div className="w-0.5 h-8 bg-gray-300 mt-2" />
        </div>
      )}

      {/* If we have parents and are showing them, render siblings row (children of the parents couple) */}
      {showParents && siblings.length > 0 && (
        <div className="w-full max-w-5xl relative -mt-2">
          {/* horizontal connector across siblings */}
          <div className="absolute left-0 right-0 top-0 h-0.5 bg-gray-300" />
          <div className="flex flex-wrap justify-center gap-8 pt-6">
            {siblings.map((sib) => (
              <div key={sib._id} className="flex flex-col items-center">
                {/* short vertical connector from horizontal line to each sibling unit */}
                <div className="w-0.5 h-6 bg-gray-300 mb-2" />
                {/* Render each sibling as its own family unit (without showing their parents again) */}
                <TreeNode
                  currentId={sib._id}
                  familyMap={familyMap}
                  visited={nextVisited}
                  maxDepth={maxDepth - 1}
                  showParents={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* If no parents to show, render the current person and then their own children row */}
      {(!showParents || parents.length === 0) && (
        <>
          <PersonWithSpouse person={current} familyMap={familyMap} />

          {ownChildren.length > 0 && (
            <div className="flex flex-col items-center mt-4 w-full max-w-5xl relative">
              <div className="w-0.5 h-8 bg-gray-300" />
              {/* horizontal line above children */}
              <div className="absolute left-0 right-0 top-8 h-0.5 bg-gray-300" />
              <div className="flex flex-wrap justify-center gap-12 pt-6">
                {ownChildren.map((child) => (
                  <div key={child._id} className="flex flex-col items-center">
                    <div className="w-0.5 h-6 bg-gray-300 mb-2" />
                    <TreeNode
                      currentId={child._id}
                      familyMap={familyMap}
                      visited={nextVisited}
                      maxDepth={maxDepth - 1}
                      showParents={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* -------------------- Top-level FamilyTree Component -------------------- */

/**
 * FamilyTree - main wrapper to accept raw members from backend (possibly ObjectIds)
 * - normalizes members
 * - builds map
 * - finds top-most ancestor to render (or self)
 */
export default function FamilyTree({ rawMembers }: { rawMembers: RawMember[] }) {
  const members = useMemo(() => normalizeMembers(rawMembers), [rawMembers]);

  const familyMap = useMemo(() => buildFamilyMap(members), [members]);

  const top = useMemo(() => findTopAncestor(members), [members]);

  // debug: log if any ids referenced are missing
  useEffect(() => {
    const missing: string[] = [];
    members.forEach((m) => {
      const refs = [
        ...(m.fathers || []),
        ...(m.mothers || []),
        ...(m.wives || []),
        ...(m.husbands || []),
        ...(m.sons || []),
        ...(m.daughters || []),
      ];
      refs.forEach((rid) => {
        if (rid && !familyMap[rid]) missing.push(rid);
      });
    });
    if (missing.length) {
      console.warn("[FamilyTree] missing referenced member ids (they were not included in rawMembers):", Array.from(new Set(missing)));
    }
  }, [members, familyMap]);

  if (!top) return <div>No members available</div>;

  return (
    <div className="overflow-auto p-4">
      {/* start rendering from top-most ancestor so siblings appear in correct rows */}
      <TreeNode currentId={top._id} familyMap={familyMap} />
    </div>
  );
}
