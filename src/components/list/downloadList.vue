<template>
  <!-- download task list panel -->
  <div id="downloading" class="hide">
    <div class="columns">
      <div id="downloadListContainer" class="column is-three-fifths is-offset-one-fifth">
        <!-- list -->

        <div id="1587900807964-download-div" class="tile is-ancestor">
          <div class="tile is-parent">
            <div class="tile is-child box">
              <div class="field">
                <span class="title is-4">av88792059-只有男人之间才有的默契</span>
                <div id="1587900807964-div" class="field">
                  <span class="title is-6">Part1-只有男人之间才有的默契</span>
                  <span onclick="downloadStartItem(1587900807964)" class="icon">
                    <a>
                      <i class="fa fa-play"></i>
                    </a>
                  </span>
                  <span onclick="downloadPauseItem(1587900807964)" class="icon">
                    <a>
                      <i class="fa fa-pause"></i>
                    </a>
                  </span>
                  <span onclick="downloadDeleteItem(1587900807964)" class="icon">
                    <a>
                      <i class="fa fa-ban"></i>
                    </a>
                  </span>
                  <p></p>
                  <span id="1587900807964-v-span">video progress:0</span>
                  <progress
                    id="1587900807964-v-progress"
                    class="progress is-primary is-small small-bottom-margin"
                    value="0"
                    max="100"
                  ></progress>
                  <span id="1587900807964-a-span">audio progress:0</span>
                  <progress
                    id="1587900807964-a-progress"
                    class="progress is-primary is-small small-bottom-margin"
                    value="0"
                    max="100"
                  ></progress>
                  <label
                    id="1587900807964-m-label"
                    class="label hide"
                  >merging videio and audio, this can really take a while</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "downloadList",
  props: {},
  data() {
    return {};
  }
};
</script>