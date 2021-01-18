<div v-for="(item, index) in _.range(0, 5)">
  <span>{{ item }}</span><span>{{ index }}</span>
  <div v-for="item in roomObjects">
    <div v-if="item.name === 'table1'"> {{ item._id}} </div>
    <div v-else> {{ item.location}} </div>
  </div>
</div>
