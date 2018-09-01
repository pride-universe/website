<template>
    <div class="navbar-end">
        <a class="navbar-item is-active">
        Home
        </a>
        <a class="navbar-item">
        Discord Servers
        </a>
        <a class="navbar-item">
        Forums
        </a>
        <a class="navbar-item">
        Blag
        </a>
        <user-widget/>
    </div>
</template>

<script>
import UserWidget from './UserWidget';

export default {
  name: 'MainMenu',
  components: {
    UserWidget
  },
  data () {
    return {
      menu: true
    };
  }
};
</script>
