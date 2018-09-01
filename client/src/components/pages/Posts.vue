<template>
  <div class="posts">
    <h1>Members</h1>

    <div v-for="member in members" :key="member.tag">
      <p>
        <span :title="member.tag" :style="{color: member.color}"><b>{{ member.name }}</b></span><br />
      </p>
    </div>
  </div>
</template>

<script>
import GuildService from '@/services/GuildService';
export default {
  name: 'members',
  data () {
    return {
      members: []
    };
  },
  mounted () {
    this.getMembers();
  },
  methods: {
    async getMembers () {
      const response = await GuildService.members('BRU');
      this.members = response.data;
    }
  }
};
</script>
