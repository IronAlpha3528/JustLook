import { useTRPC } from "@/trpc/client";
import { PageClient } from "./client";
import { dehydrate, HydrationBoundary, useSuspenseQuery } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import {ErrorBoundary} from "react-error-boundary"

export default async function Home() {

  const queryClient = getQueryClient()

  await queryClient.query(trpc.hello.queryOptions({ text: "Abhay" }))

  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <PageClient />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
