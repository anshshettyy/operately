import React from "react";

import { useNavigate } from "react-router-dom";
import * as Groups from "@/graphql/Groups";
import * as Icons from "@tabler/icons-react";

import Avatar from "@/components/Avatar";
import { GhostButton } from "@/components/Button";

export default function MemberList({ group }: { group: Groups.Group }) {
  const navigate = useNavigate();
  const gotoGroupMembersPage = () => navigate(`/groups/${group.id}/members`);

  return (
    <div>
      <div
        className="inline-flex gap-2 items-center mb-4 cursor-pointer"
        onClick={gotoGroupMembersPage}
        data-test-id="group-members"
      >
        {group.members.map((m) => (
          <Avatar key={m.id} person={m} size={24} />
        ))}
      </div>
    </div>
  );
}
