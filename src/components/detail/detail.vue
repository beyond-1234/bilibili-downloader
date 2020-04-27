<template>
  
</template>

<script>
export default {
  name: "detail",
  props: ['showDetail', 'videoData'],
  methods: {
    hasAccept(acceptCode) {
      return this.videoData["accept"][acceptCode] != null ? true : false;
    },
    startDownload(){

    },
    cancel(){
      this.showDetail = false
    }
  }
};
</script>