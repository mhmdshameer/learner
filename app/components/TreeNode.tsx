"use client";

import React from "react";
import MemberCard from "./card";

// Matches your schema
export type MemberNode = {
  _id: string;
  name: string;
  imageUrl: string;
  relation: string; // 'self' | 'father' | 'mother' | 'wife' | 'husband' | 'son' | 'daughter'
  displayRelation?: string;
  fathers?: string[];
  mothers?: string[];
  wives?: string[];
  husbands?: string[];
  sons?: string[];
  daughters?: string[];
};

export type FamilyMap = Record<string, MemberNode>;

interface TreeNodeProps {
  currentId: string;
  familyMap: FamilyMap;
}

/** Show person card with their spouse(s) beside */
function PersonWithSpouse({
  person,
  familyMap,
}: {
  person: MemberNode;
  familyMap: FamilyMap;
}) {
  const spouses: MemberNode[] = [
    ...(person.wives?.map((id) => familyMap[id]).filter(Boolean) || []),
    ...(person.husbands?.map((id) => familyMap[id]).filter(Boolean) || []),
  ];

  const relationLabel =
    person.relation === "self"
      ? "Me"
      : person.displayRelation?.trim() ||
        person.relation.charAt(0).toUpperCase() + person.relation.slice(1);

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
      {spouses.map((spouse) => (
        <React.Fragment key={spouse._id}>
          <div className="h-0.5 w-6 bg-gray-300" />
          <MemberCard
            relation={
              spouse.displayRelation?.trim() ||
              spouse.relation.charAt(0).toUpperCase() + spouse.relation.slice(1)
            }
            name={spouse.name}
            imageUrl={spouse.imageUrl}
            memberId={spouse._id}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

/** Recursive family tree renderer */
export default function TreeNode({ currentId, familyMap }: TreeNodeProps) {
  const current = familyMap[currentId];
  if (!current) return null;

  const fatherNodes =
    current.fathers?.map((id) => familyMap[id]).filter(Boolean) || [];
  const motherNodes =
    current.mothers?.map((id) => familyMap[id]).filter(Boolean) || [];
  const parents = [...fatherNodes, ...motherNodes];

  const childIds = [...(current.sons || []), ...(current.daughters || [])];
  const children = childIds.map((id) => familyMap[id]).filter(Boolean);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Parents */}
      {parents.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-8">
            {parents.map((p) => (
              <TreeNode key={p._id} currentId={p._id} familyMap={familyMap} />
            ))}
          </div>
          <div className="w-0.5 h-8 bg-gray-300 mt-2" />
        </div>
      )}

      {/* Current person + spouse(s) */}
      <PersonWithSpouse person={current} familyMap={familyMap} />

      {/* Children */}
      {children.length > 0 && (
        <div className="flex flex-col items-center mt-4">
          <div className="w-0.5 h-8 bg-gray-300" />
          <div className="flex items-center justify-center gap-12 mt-2">
            {children.map((child) => (
              <TreeNode
                key={child._id}
                currentId={child._id}
                familyMap={familyMap}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
