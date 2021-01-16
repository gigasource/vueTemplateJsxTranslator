module.exports = `<div class="product-editor__prop-grid">
      <template v-if="types">
        <div>{{$t('article.type')}}</div>
        <g-select :disabled="!!(type && selectedProduct.id && selectedProduct.name && selectedProduct.price)" skip-search
                  text-field-component="GTextFieldBs" v-model="type" :items="types" @update:modelValue="changeType"/>
      </template>

      <template v-if="isProductLayout">
        <div>{{$t('article.id')}} </div>
        <g-text-field-bs :model-value="selectedProduct.id" @update:modelValue="setProductInfo('id', $event);debouncedUpdateProduct('id', $event)">
          <template #append-inner>
            <g-icon style="cursor: pointer" @click="openDialogInfo('id')">icon-keyboard</g-icon>
          </template>
        </g-text-field-bs>

        <div>{{$t('article.name')}} <span style="color: #FF4452">*</span></div>
        <g-text-field-bs :model-value="selectedProduct.name" @update:modelValue="setProductInfo('name', $event);debouncedUpdateProduct('name', $event)">
          <template #append-inner>
            <g-icon style="cursor: pointer" @click="openDialogInfo('name')">icon-keyboard</g-icon>
          </template>
        </g-text-field-bs>

        <div>{{$t('article.price')}} <span style="color: #FF4452">*</span></div>
        <g-text-field-bs :model-value="selectedProduct.price" @update:modelValue="setProductInfo('price', $event);debouncedUpdateProduct('price', $event)">
          <template #append-inner>
            <g-icon style="cursor: pointer" @click="openDialogInfo('price')">icon-keyboard</g-icon>
          </template>
        </g-text-field-bs>

        <g-switch :model-value="selectedProduct.isModifier" @update:modelValue="updateProduct({ isModifier: $event })" />
        <div style="font-size: 13px">{{$t('article.isModifier')}}</div>
      </template>

      <template v-else>
        <div>{{$t('article.name')}} <span style="color: #ff4552">*</span></div>
        <g-text-field :model-value="selectedProductLayout.text" @update:modelValue="debounceUpdateTextLayout('text', $event)">
          <template #append-inner>
            <g-icon style="cursor: pointer" @click="dialog.showTextKbd = true">icon-keyboard</g-icon>
          </template>
        </g-text-field>
      </template>
    </div>`
