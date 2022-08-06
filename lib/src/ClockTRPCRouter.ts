import { createServiceRoute } from "@coderatparadise/showrunner-network";
import { inferAsyncReturnType,initTRPC } from "@trpc/server";
import { z } from "zod";
import { ClockManager } from "./ClockManager.js";

type Context = {
    show: string;
    session: string;
};

const t = initTRPC<{ ctx: Context }>()();
let clockManager: ClockManager;
const router = t.router({
    play: t.procedure
        .input(
            z.string()
        )
        .output(z.void())
        .query(({ input }) => {clockManager?.play(input)}),
    pause: t.procedure
        .input(
            z.object({
                identifier: z.object({
                    show: z.string(),
                    session: z.string(),
                    id: z.string()
                })
            })
        )
        .output(z.void())
        .query(({ input }) => {}),
    stop: t.procedure
        .input(
            z.object({
                identifier: z.object({
                    show: z.string(),
                    session: z.string(),
                    id: z.string()
                })
            })
        )
        .output(z.void())
        .query(({ input }) => {}),
    reset: t.procedure
        .input(
            z.object({
                identifier: z.object({
                    show: z.string(),
                    session: z.string(),
                    id: z.string()
                })
            })
        )
        .output(z.void())
        .query(({ input }) => {}),
    setTime: t.procedure
        .input(
            z.object({
                identifier: z.object({
                    show: z.string(),
                    session: z.string(),
                    id: z.string()
                }),
                time: z.string()
            })
        )
        .output(z.void())
        .mutation(({ input }) => {}),
    listClocks: t.procedure.output(z.array(z.string())).subscription(() => { return []}),
});
