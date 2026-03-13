import type { PagesFunction } from "@cloudflare/workers-types";
import { onRequestPost as basePost, onRequestGet as baseGet } from "../register";

export const onRequestPost: PagesFunction = async (context) => {
  return basePost(context);
};

export const onRequestGet: PagesFunction = async (context) => {
  return baseGet(context);
};

