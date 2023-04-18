import React from 'react';
import Avatar from '../../components/Avatar';

interface Person {
  fullName: string;
  title: string;
  id: string;
}

export default function Champion({person} : {person: Person}) : JSX.Element {
  return (
    <div className="mt-4 flex gap-2 items-center">
      <Avatar person_full_name={person.fullName} />
      <div>
        <div className="font-bold">{person.fullName}</div>
        <div className="text-dark-1">{person.title}</div>
      </div>
    </div>
  );
}
