<div>
  <div v-if="showFirst">ShowFirst</div>
  <div v-else-if="1 + 1 === 2">Show second</div>
  <div v-else-if="2 + 2 === 4"> Show third</div>
  <div v-else-if="2 + 2 === 4">
    <div>
      <p> hello</p>
    </div>
    <div v-if="1 === 1"> world</div>
    <div v-else> ! </div>
  </div>
  <div v-else> default </div>
</div>
