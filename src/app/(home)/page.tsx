import {
  dehydrate,
  HydrationBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { HomeView } from "@/modules/home/ui/views/home-view";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { categoryId } = await searchParams;

  const queryClient = getQueryClient();

  await queryClient
    .query(trpc.categories.getMany.queryOptions())
    .catch(() => {});

  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeView categoryId={categoryId} />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
