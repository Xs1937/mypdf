<template>
  <div class="index-page">
    <sub-tree-index
      type="type"
    ></sub-tree-index>
    <el-card>
      <p>Hello {{name}}</p>
    </el-card>
    <el-image :src="require('@/pages/index/imgs/icon1.png')"></el-image>
    <el-image :src="require('@/assets/images/icon4.png')"></el-image>
  </div>
</template>

<script>
import subTreeIndex from "../../subtree/subTreeIndex.vue";

export default {
    components: { subTreeIndex },
    data() {
        return {
            name: "cyc"
        }
    },
    mounted() {
    },
    methods: {
    }
}
</script>

<style lang="less" scoped>
@mainColor: #333;
@bgColor: #409EFF;

.index-page {
  ::v-deep.el-card__body {
    background-color: @bgColor;
  }

  p {
    color: @mainColor;
  }
}
</style>
