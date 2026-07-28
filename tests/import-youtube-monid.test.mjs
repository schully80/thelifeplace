import assert from "node:assert/strict";
import test from "node:test";

import {
  mergeMessages,
  toMessage,
} from "../src/scripts/import-youtube-monid.js";

const now = new Date("2026-07-27T08:00:00.000Z");

test("maps a normalized Monid YouTube video to the message contract", () => {
  const message = toMessage(
    {
      video_id: "abc123",
      title: "Grace & Truth — Part 1",
      thumbnail: "https://example.com/thumb.jpg",
      published_time: "2 weeks ago",
      description: "A message about Jesus.",
    },
    now,
  );

  assert.deepEqual(message, {
    id: "grace-truth-part-1",
    title: "Grace & Truth — Part 1",
    preacher: "Schulter Etyang",
    preacherSlug: "schulter-etyang",
    series: "General",
    seriesSlug: "general",
    date: "2026-07-13",
    videoSource: "youtube",
    youtubeId: "abc123",
    audioUrl: null,
    thumbnail: "https://example.com/thumb.jpg",
    description: "A message about Jesus.",
    scriptures: [],
    tags: [],
  });
});

test("deduplicates by YouTube ID and respects the import limit", () => {
  const existing = [{ id: "existing", youtubeId: "already-here" }];
  const videos = [
    { video_id: "already-here", title: "Existing" },
    { video_id: "new-1", title: "New Message" },
    { video_id: "new-2", title: "Another Message" },
  ];

  const result = mergeMessages(existing, videos, { limit: 1, now });

  assert.equal(result.additions.length, 1);
  assert.equal(result.additions[0].youtubeId, "new-1");
  assert.equal(result.messages.length, 2);
});

test("makes duplicate generated slugs unique", () => {
  const result = mergeMessages(
    [{ id: "same-title", youtubeId: "old" }],
    [{ video_id: "new", title: "Same Title" }],
    { now },
  );

  assert.equal(result.additions[0].id, "same-title-2");
});
