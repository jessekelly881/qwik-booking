import { component$ } from "@builder.io/qwik";
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  z,
  zod$
} from "@builder.io/qwik-city";

interface ListItem {
  text: string;
}

export const list: ListItem[] = [];

export const useListLoader = routeLoader$(() => {
  return list;
});

export const useAddToListAction = routeAction$(
  (item) => {
    list.push(item);
    return {
      success: true,
    };
  },
  zod$({
    text: z.string().trim().min(1),
  }),
);

export default component$(() => {
  return (
    <>
    </>
  );
});

export const head: DocumentHead = {
  title: "Bookings",
};
