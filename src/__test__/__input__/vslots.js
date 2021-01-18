<div>
  <template #action="toggle">
  <button>
    Click me!!!
  </button>
  </template>
  <div>
    default slot
  </div>
  <g-btn>
    <template v-slot:append-inner>
      <img/>
    </template>
  </g-btn>
</div>
