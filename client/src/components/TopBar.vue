<template>
    <section class="hero is-primary is-medium">
        <!-- Hero head: will stick at the top -->
        <div class="hero-head">
            <nav class="navbar">
            <div class="container">
                <div class="navbar-brand">
                    <a class="navbar-item">
                        <img src="https://bulma.io/images/bulma-type-white.png" alt="Logo">
                    </a>
                    <span class="navbar-burger burger" :class="{'is-active': showMenu}" @click="toggleMenu" aria-label="menu" aria-expanded="false">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
                <div :class="{'is-active': showMenu}" class="navbar-menu">
                    <main-menu />
                </div>
            </div>
            </nav>
        </div>
    </section>
</template>

<script>
import MainMenu from './MainMenu';

export default {
  name: 'TopBar',
  components: {
    MainMenu
  },
  data () {
    return {
      showMenu: false
    };
  },
  methods: {
    toggleMenu () {
      this.showMenu = !this.showMenu;
    }
  }
};
</script>
