import { useQuery } from "@apollo/client";
import { LoadingState } from "@components/ui/LoadingState";
import { EXPLORE_QUERY } from "@utils/gql/queries";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import React, { useState } from "react";
import { useInView } from "react-cool-inview";
import { PaginatedResultInfo } from "src/types";
import { LenstubePublication } from "src/types/local";
dayjs.extend(relativeTime);

const SuggestedVideos = () => {
  const [videos, setVideos] = useState<LenstubePublication[]>([]);
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>();
  const { loading, error, fetchMore } = useQuery(EXPLORE_QUERY, {
    variables: {
      request: {
        sortCriteria: "TOP_COMMENTED",
        limit: 10,
      },
    },
    onCompleted(data) {
      setPageInfo(data?.explorePublications?.pageInfo);
      setVideos(data?.explorePublications?.items);
    },
  });

  const { observe } = useInView({
    threshold: 1,
    onEnter: () => {
      fetchMore({
        variables: {
          request: {
            cursor: pageInfo?.next,
            sortCriteria: "TOP_COMMENTED",
            limit: 10,
          },
        },
      }).then(({ data }: any) => {
        setPageInfo(data?.explorePublications?.pageInfo);
        setVideos([...videos, ...data?.explorePublications?.items]);
      });
    },
  });
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="inline-flex items-center mb-3 text-lg font-semibold">
          More Videos
        </h1>
      </div>
      {!error && !loading && (
        <>
          <div className="space-y-3">
            {videos?.map((video: LenstubePublication, index: number) => (
              <div key={`${video?.id}_${index}`} className="flex space-x-2">
                <div className="flex-none w-1/2 overflow-hidden rounded">
                  <img
                    src="https://i.ytimg.com/vi/VgjyPmFKxCU/hqdefault.jpg"
                    alt=""
                    draggable={false}
                    className="object-cover object-center w-full h-24"
                  />
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="flex flex-col items-start flex-1 pb-1">
                    <span className="flex w-full items-start justify-between space-x-1.5">
                      <Link passHref href="/videos/0x02-0x05">
                        <a className="mb-1.5 text-sm font-medium line-clamp-2">
                          {video.metadata?.name}
                        </a>
                      </Link>
                    </span>
                    <Link href={`/${video.profile?.handle}`}>
                      <a className="text-xs hover:opacity-100 opacity-70">
                        T Series
                      </a>
                    </Link>
                    <div className="flex items-center text-xs opacity-70 mt-0.5">
                      <span className="mr-1 whitespace-nowrap">1k views ·</span>
                      <span>{dayjs(new Date(video.createdAt)).fromNow()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {pageInfo?.next && videos.length !== pageInfo?.totalCount && (
            <span ref={observe} className="flex justify-center p-5">
              <LoadingState />
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default SuggestedVideos;