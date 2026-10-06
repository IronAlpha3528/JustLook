"use client"

import { TRPCProvider, useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"


export const PageClient = ( ) => {

    const trpc = useTRPC()

    const {data} = useSuspenseQuery(trpc.hello.queryOptions({text:"Abhay"}))

    return (
        <div>
            Page Client says: {data.greeting}
        </div>

    )
}