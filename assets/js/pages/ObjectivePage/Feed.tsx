import React from 'react';

import { useQuery, gql, useApolloClient } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import Avatar, {AvatarSize} from '../../components/Avatar';
import Editor from '../../components/Editor';
import RelativeTime from '../../components/RelativeTime';
import RichContent from '../../components/RichContent';

import PeopleSuggestions from './PeopleSuggestions';
import SectionHeader from './SectionHeader';

interface Person {
  fullName: string;
  title: string;
  id: string;
}

interface Comment {
  id: string;
  content: string;
  author: Person;
  insertedAt: string;
}

interface Update {
  id: string;
  content: string;
  author: Person;
  insertedAt: string;
  comments: Comment[];
}

const UPDATE_ADDED_SUBSCRIPTION = gql`
  subscription OnUpdateAdded($updatableId: ID!, $updatableType: String!) {
    updateAdded(updatableId: $updatableId, updatableType: $updatableType) {
      id
    }
  }
`;

const COMMENT_ADDED_SUBSCRIPTION = gql`
  subscription OnCommentAdded($updatableId: ID!, $updatableType: String!) {
    commentAdded(updatableId: $updatableId, updatableType: $updatableType) {
      id
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
    }
  }
`;

const GET_UPDATES = gql`
  query updates($updatableId: ID!, $updatableType: String!) {
    updates(updatableId: $updatableId, updatableType: $updatableType) {
      id
      content
      insertedAt

      author {
        id
        fullName
      }

      comments {
        content
        insertedAt

        author {
          id
          fullName
        }
      }
    }
  }
`;

function ShortName({fullName} : {fullName: string}) : JSX.Element {
  const [firstName, lastName] = fullName.split(" ");

  return <>{firstName} {lastName[0]}.</>;
}

function FeedItem({update} : {update: Update}) : JSX.Element {
  return (
    <div className="rounded-lg bg-white border border-dark-8% overflow-hidden">
      <div className="p-4">
        <div className="pb-4 border-b border-dark-8%">
          <div className="flex gap-1.5 items-center">
            <Avatar person_full_name={update.author.fullName} size={AvatarSize.Small} />
            <span className="text-dark-1 ml-1"><ShortName fullName={update.author.fullName}></ShortName></span>
            <span className="text-dark-2 text-xs">posted an update <RelativeTime date={update.insertedAt} /></span>
          </div>
        </div>
        <RichContent className="mt-4 text-dark-1" jsonContent={update.content} />

        <Comments comments={update.comments} />
      </div>
      <CommentEditor updateId={update.id} />
    </div>
  );
}

function Comment({comment}) : JSX.Element {
  return <div>
    <div className="flex gap-1.5 items-center mt-4 pt-4 border-t border-dark-8%">
      <Avatar person_full_name={comment.author.fullName} size={AvatarSize.Small} />
      <span className="text-dark-1"><ShortName fullName={comment.author.fullName}></ShortName></span>
      <span className="text-dark-2 text-xs"><RelativeTime date={comment.insertedAt} /></span>
    </div>

    <RichContent className="ml-8 mt-2 text-dark-1" jsonContent={comment.content} />
  </div>;
}

function Comments({comments} : {comments: any[]}) : JSX.Element {
  return <>{comments.map((comment) => <Comment key={comment.id} comment={comment} />)}</>;
}

function CommentEditor({updateId}) : JSX.Element {
  const [active, setActive] = React.useState(false);

  const { t } = useTranslation();
  const client = useApolloClient();
  const peopleSearch = PeopleSuggestions(client);

  const handleAddComment = async ({json}) => {
    await client.mutate({
      mutation: CREATE_COMMENT,
      variables: {
        input: {
          updateId: updateId,
          content: JSON.stringify(json)
        }
      }
    })

    setActive(false);
  }

  const handleBlur = ({html}) => {
    if(html === "<p></p>") {
      setActive(false);
    }
  }

  if (!active) {
    return (
      <div className="p-4 text-dark-2 cursor-pointer bg-light-1 flex items-center gap-2" onClick={() => setActive(true)}>
        <Avatar person_full_name="IS" size={AvatarSize.Small} />
        <span>{t("objectives.leave_comment.placeholder")}</span>
      </div>
    );
  } else {
    return <div className="border-t border-dark-8%">
      <Editor
        placeholder={t("objectives.leave_comment.placeholder")}
        peopleSearch={peopleSearch}
        onSave={handleAddComment}
        onBlur={handleBlur}
      />
    </div>
  }
}


export default function Feed({objectiveID} : {objectiveID: string}) : JSX.Element {
  const { t } = useTranslation();
  const { loading, error, data, refetch, subscribeToMore } = useQuery(GET_UPDATES, {
    variables: {
      updatableId: objectiveID,
      updatableType: "objective"
    }
  });

  React.useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: UPDATE_ADDED_SUBSCRIPTION,
      variables: {
        updatableId: objectiveID,
        updatableType: "objective"
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        refetch();
        return prev;
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: COMMENT_ADDED_SUBSCRIPTION,
      variables: {
        updatableId: objectiveID,
        updatableType: "objective"
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        refetch();
        return prev;
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>{t("loading.loading")}</p>;
  if (error) return <p>{t("error.error")}: {error.message}</p>;

  if(data.updates.length == 0) {
    return <></>;
  }

  return <div className="mt-4" data-test="feed">
    <SectionHeader>{t("objectives.feed.title")}</SectionHeader>

    <div className="flex flex-col gap-2.5">
      {data.updates.slice(0).reverse().map((update : Update) => <FeedItem key={update.id} update={update} />)}
    </div>
  </div>;
}
