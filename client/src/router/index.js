import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/pages/HelloWorld';
import Root from '@/components/pages/Root';
import Posts from '@/components/pages/Posts';
import Oauth2 from '@/components/pages/Oauth2';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Root,
      children: [
        {
          path: '/',
          name: 'HelloWorld',
          component: HelloWorld
        },
        {
          path: '/posts',
          name: 'Posts',
          component: Posts
        }
      ]
    },
    {
      path: '/oauth2',
      name: 'Oauth2',
      component: Oauth2
    }
  ]
});
