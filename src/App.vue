<template>
  <div id="app">
    <router-view />
<!--    Hello World!-->
  </div>
</template>

<script>
export default {
    name: "App",
    mounted() {
        this.aa();
    },
    methods: {
        aa() {
            setTimeout(() => {
                console.log("aaa");
            }, 2000)
        }
    }
}
</script>

<style scoped>
</style>
