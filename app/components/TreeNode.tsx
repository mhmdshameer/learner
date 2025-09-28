"use client";

import React, { useMemo } from "react";
import MemberCard from "./card";

export type MemberNode = {
  _id: string;
  name: string;
  imageUrl: string;
  relation: string; // 'self' | 'father' | 'mother' | 'wife' | 'son' | 'daughter' | ...
  linkedTo: string | null; // parent or partner linkage depending on relation
  displayRelation?: string; // Optional label to show on card relative to the user
  // Relationship arrays
  fathers?: string[];
  mothers?: string[];
  wives?: string[];
  husbands?: string[];
  sons?: string[];
  daughters?: string[];
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
};

interface TreeNodeProps {
  current: MemberNode;
  all: Record<string, MemberNode>;
  // Rendering controls
  mode?: 'full' | 'ancestorsOnly' | 'descendantsOnly';
  showSpouse?: boolean;
}

function useSpouse(current: MemberNode, all: Record<string, MemberNode>) {
  return useMemo(() => {
    // Spouse logic:
    // - If someone has relation 'wife' and linkedTo === current._id, that is spouse
    // - If current is 'wife' and has linkedTo, spouse is the member whose _id === current.linkedTo
    const wife = Object.values(all).find(
      (m) => m.relation === "wife" && m.linkedTo === current._id
    );
    if (wife) return wife;
    if (current.relation === "wife" && current.linkedTo) {
      return all[current.linkedTo] || null;
    }
    return null;
  }, [all, current]);
}

function useParents(current: MemberNode, all: Record<string, MemberNode>) {
  return useMemo(() => {
    const isRoot = current.relation === "self";
    
    // Get parents from relationship arrays if available
    if (current.fathers?.length || current.mothers?.length) {
      return {
        father: current.fathers?.[0] ? all[current.fathers[0]] : null,
        mother: current.mothers?.[0] ? all[current.mothers[0]] : null,
      };
    }

    // Fallback to old logic if relationship arrays are not available
    const allMembers = Object.values(all);
    let father = allMembers.find(m => 
      m.relation === "father" && 
      (m.linkedTo === current._id || 
       (isRoot && (!m.linkedTo || m.linkedTo === 'undefined')))
    ) || null;
    
    const mother = allMembers.find(
      (m) => m.relation === "mother" && 
      (m.linkedTo === current._id || (isRoot && (m.linkedTo === null || typeof m.linkedTo === 'undefined')))
    ) || null;

    // If father not directly found, try to infer via a wife's linkage
    let motherViaWife: MemberNode | null = null;
    if (!father) {
      console.log("Father not found directly. Trying via wife...");
      const allValues = Object.values(all);
      const wifePointingToFather = allValues.find((w) => {
        if (w.relation !== 'wife' || !w.linkedTo) return false;
        const f = allValues.find((x) => x._id === w.linkedTo && x.relation === 'father');
        if (!f) return false;
        const connected = f.linkedTo === current._id || (isRoot && (f.linkedTo === null || typeof f.linkedTo === 'undefined'));
        if (connected) {
          father = f;
          motherViaWife = w;
          return true;
        }
        return false;
      });
      void wifePointingToFather; // no-op just to make linter happy about the variable not used
    }

    console.log("Found parents for", current.name, ":", {
        father: father ? father.name : 'null',
        mother: mother ? mother.name : 'null',
        motherViaWife: (motherViaWife as MemberNode | null)?.name ?? 'null'
    });
    return { father, mother, motherViaWife };
  }, [all, current]);
}

function useChildren(current: MemberNode, spouse: MemberNode | null, all: Record<string, MemberNode>) {
  return useMemo(() => {
    const allMembers = Object.values(all);
    
    // Get children from relationship arrays if available
    const childIds = [
      ...(current.sons || []),
      ...(current.daughters || []),
      ...(spouse?.sons || []),
      ...(spouse?.daughters || [])
    ];
    
    if (childIds.length > 0) {
      return childIds.map(id => all[id]).filter((m): m is MemberNode => !!m);
    }
    
    // Fallback to old logic if relationship arrays are not available
    let children = allMembers.filter(
      (m) => m.linkedTo === current._id && (m.relation === "son" || m.relation === "daughter")
    );
    
    // Also include children linked to spouse if they exist
    if (spouse) {
      const spouseChildren = allMembers.filter(
        (m) => m.linkedTo === spouse._id && (m.relation === "son" || m.relation === "daughter")
      );
      children = [...children, ...spouseChildren];
    }
    
    return children;
  }, [all, current._id, spouse?._id, current.sons, current.daughters, spouse?.sons, spouse?.daughters]);
}

export default function TreeNode({ current, all, mode = 'full', showSpouse = true }: TreeNodeProps) {
  const spouse = useSpouse(current, all);
  const { father, mother, motherViaWife } = useParents(current, all);
  const children = useChildren(current, spouse, all);

  const relationLabel = current.relation === "self"
    ? "Me"
    : (current.displayRelation?.trim() || (current.relation[0].toUpperCase() + current.relation.slice(1)));

  // If no explicit mother, but there is a father, use father's wife as the mother for display
  const fathersWife = useMemo(() => {
    if (!father) return null;
    return Object.values(all).find((m) => m.relation === 'wife' && m.linkedTo === father._id) || null;
  }, [all, father]);
  const displayMother = mother || motherViaWife || fathersWife;

  // Siblings (children of parents). We intentionally do not recurse siblings to keep layout compact.
  const parentChildren = useMemo(() => {
    const ids = new Set<string>();
    if (father?._id) ids.add(father._id);
    if (displayMother?._id) ids.add(displayMother._id);
    if (ids.size === 0) return [] as MemberNode[];
    return Object.values(all).filter(
      (m) => (m.relation === 'son' || m.relation === 'daughter') && !!m.linkedTo && ids.has(m.linkedTo) && m._id !== current._id
    );
  }, [all, father, displayMother, current._id]);

  const hasParents = !!(father || displayMother);

  return (
    <div className="flex flex-col items-center gap-6 bg-transparent">
      {/* Parents row (render ancestors recursively) */}
      {hasParents && (
        <div className="flex flex-col items-center">
          <div className="relative flex items-center gap-6">
            {father && (
              <TreeNode current={father} all={all} mode={'ancestorsOnly'} showSpouse={false} />
            )}
            {displayMother && (
              <TreeNode current={displayMother} all={all} mode={'ancestorsOnly'} showSpouse={false} />
            )}
            {father && displayMother && (
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 h-0.5 w-10 bg-gray-300" />
            )}
          </div>
          {/* Connector down from parents to children rail */}
          <div className="h-6 w-0.5 bg-gray-300 mt-2" />

          {/* Children rail: siblings + current share a horizontal rail */}
          {mode === 'full' && (
            <div className="mt-2 w-full max-w-4xl relative">
              {/* Horizontal rail */}
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-gray-300" />
              {/* Children under the rail */}
              <div className="flex flex-wrap justify-center gap-6 pt-2">
                {[...parentChildren, current].map((child) => (
                  <div key={child._id} className="flex flex-col items-center">
                    {/* Connector from rail to each child */}
                    <div className="h-4 w-0.5 bg-gray-300 mb-2" />
                    {child._id === current._id ? (
                      <div className="relative flex items-center gap-6">
                        <MemberCard
                          relation={relationLabel}
                          name={current.name}
                          imageUrl={current.imageUrl}
                          memberId={current._id}
                          onEdit={() => {}}
                          onDelete={() => {}}
                        />
                        {showSpouse && spouse && (
                          <>
                            <MemberCard
                              relation={spouse.displayRelation?.trim() || (spouse.relation === "wife" ? "Wife" : spouse.relation[0].toUpperCase() + spouse.relation.slice(1))}
                              name={spouse.name}
                              imageUrl={spouse.imageUrl}
                              memberId={spouse._id}
                              onEdit={() => {}}
                              onDelete={() => {}}
                            />
                            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 h-0.5 w-10 bg-gray-300" />
                          </>
                        )}
                      </div>
                    ) : (
                      <MemberCard
                        relation={child.displayRelation?.trim() || (child.relation === 'son' ? 'Brother' : child.relation === 'daughter' ? 'Sister' : child.relation[0].toUpperCase() + child.relation.slice(1))}
                        name={child.name}
                        imageUrl={child.imageUrl}
                        memberId={child._id}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* When there are no parents, show current + spouse normally */}
      {!hasParents && (
        <div className="relative flex items-center gap-6">
          <MemberCard
            relation={relationLabel}
            name={current.name}
            imageUrl={current.imageUrl}
            memberId={current._id}
            onEdit={() => {}}
            onDelete={() => {}}
          />
          {showSpouse && spouse && (
            <>
              <MemberCard
                relation={spouse.displayRelation?.trim() || (spouse.relation === "wife" ? "Wife" : spouse.relation[0].toUpperCase() + spouse.relation.slice(1))}
                name={spouse.name}
                imageUrl={spouse.imageUrl}
                memberId={spouse._id}
                onEdit={() => {}}
                onDelete={() => {}}
              />
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 h-0.5 w-10 bg-gray-300" />
            </>
          )}
        </div>
      )}

      {/* Descendants */}
      {mode !== 'ancestorsOnly' && (
        <>
          {children.length > 0 && <div className="h-6 w-0.5 bg-gray-300" />}
          {children.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6">
              {children.map((child) => (
                <div key={child._id} className="flex flex-col items-center">
                  {/* Small connector above each child */}
                  <div className="h-4 w-0.5 bg-gray-300 mb-2" />
                  {/* Recurse for each child to allow deeper levels */}
                  <TreeNode current={child} all={all} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
