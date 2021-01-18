<div style="diplay: 'block'">
  <g-btn big v-model="value" :color="color" :small="true"  :backgroud-color=" bg "v-if="1===1"
  @click="toggle" @touch="doSomething()"/>
  <input @input-change.prevent.stop="update($event)" v-model="data"/>
</div>
