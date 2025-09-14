import { create } from "xmlbuilder2";
import { Topic } from "@prisma/client";
import { escapeCData } from "./utilitySerializer";

export const topicBuilder = (topic: Topic) => create({
  Topic: {
    "@id": topic.id,
    "Name": { $: escapeCData(topic.name) },
    "Summary": { $: escapeCData(topic.summary) }
  }
}).end({ prettyPrint: true, headless: true });
