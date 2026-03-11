<template>
  <div>
    <el-button type="primary" @click="clickBtn">这个是子项目的按钮</el-button>
  </div>
</template>

<script>
export default {
  props: ["type"],
  data () {
    return {
      str: "这里是alert的内容"
    }
  },
  mounted () {
    console.log(this.type);
  },
  methods: {
    clickBtn() {
      this.$message.success(this.str);
    }
  }
}
</script>