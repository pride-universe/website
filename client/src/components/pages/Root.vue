<template>
    <div id="app">
        <top-bar/>
        <router-view/>
    </div>
</template>

<script>
import TopBar from '../TopBar';

export default {
  name: 'Root',
  components: {
    TopBar
  }
};
</script>
