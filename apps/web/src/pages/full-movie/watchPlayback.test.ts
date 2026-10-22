import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isWatchableTitle,
  resetWatchPlayback,
  seasonEpisodeForProvider,
} from "./watchPlayback.ts";

describe("resetWatchPlayback", () => {
  it("drops the previous stream and episode when the title changes", () => {
    const previous = {
      currentProviderUrl:
        "https://vsembed.ru/embed/tv/1396?season=3&episode=5&autonext=1",
      selectedEpisode: { season_number: 3, episode_number: 5 },
      info: { id: 1396 },
      status: "ready" as const,
    };

    const next = resetWatchPlayback(isWatchableTitle("1399", "tv"));

    assert.equal(next.currentProviderUrl, "");
    assert.equal(next.selectedEpisode, null);
    assert.equal(next.info, undefined);
    assert.equal(next.status, "loading");
    assert.equal(next.currentProviderUrl.includes("1396"), false);
    assert.deepEqual(seasonEpisodeForProvider(previous.selectedEpisode), {
      season: 3,
      episode: 5,
    });
    assert.deepEqual(seasonEpisodeForProvider(next.selectedEpisode), {
      season: 1,
      episode: 1,
    });
  });

  it("clears playback and marks an invalid or blocked title not found", () => {
    const cases: Array<[string | null, string | null]> = [
      [null, "movie"],
      ["", "tv"],
      ["550", "person"],
      ["550", null],
      ["1439112", "movie"],
    ];
    for (const [movieId, type] of cases) {
      const next = resetWatchPlayback(isWatchableTitle(movieId, type));
      assert.equal(next.currentProviderUrl, "");
      assert.equal(next.selectedEpisode, null);
      assert.equal(next.info, undefined);
      assert.equal(next.status, "not_found");
    }
    assert.equal(isWatchableTitle("550", "movie"), true);
    assert.equal(isWatchableTitle("1396", "tv"), true);
  });
});
