<div className="product-editor__prop-grid">
  {(types) ? <template>
    <div>{{ $t('article.type')}}</div>
    <g-select disabled={!!(type && selectedProduct.id && selectedProduct.name && selectedProduct.price)} skip-search text-field-component="GTextFieldBs" v-model="type" items={types} onUpdate:modelvalue={changeType}></g-select>
  </template> : null}
  null
  {(isProductLayout) ? <template>
    <div>{{ $t('article.id')}} </div>
    {const slotOfg_text_field_bs = {
      append-inner: () => <>,<g-icon style="cursor: pointer" onClick={openDialogInfo('id')}>icon-keyboard</g-icon>,</>
    }
    }
    <g-text-field-bs model-value={selectedProduct.id} onUpdate:modelvalue={setProductInfo('id', $event);debouncedUpdateProduct('id', $event)} v-slots={slotOfg_text_field_bs}></g-text-field-bs>

    <div>{{ $t('article.name')}}
      <span style="color: #FF4452">*</span>
    </div>

    {const slotOfg_text_field_bs = {
      append-inner: () => <>,<g-icon style="cursor: pointer" onClick={openDialogInfo('name')}>icon-keyboard</g-icon>,</>
    }}
    <g-text-field-bs model-value={selectedProduct.name} onUpdate:modelvalue={setProductInfo('name', $event);debouncedUpdateProduct('name', $event)} v-slots={slotOfg_text_field_bs}></g-text-field-bs>

    <div>{{ $t('article.price')}}
      <span style="color: #FF4452">*</span>
    </div>

    {const slotOfg_text_field_bs = {
      append-inner: () => <>,<g-icon style="cursor: pointer" onClick={openDialogInfo('price')}>icon-keyboard</g-icon>,</>
    }
    }
    <g-text-field-bs model-value={selectedProduct.price} onUpdate:modelvalue={setProductInfo('price', $event);debouncedUpdateProduct('price', $event)} v-slots={slotOfg_text_field_bs}>
    </g-text-field-bs>

    <g-switch model-value={selectedProduct.isModifier} onUpdate:modelvalue={updateProduct({ isModifier: $event })}>
      <div style="font-size: 13px">{{ $t('article.isModifier')}}</div>
    </g-switch>
  </template> : null}
  null
  <template>
    <div>{{ $t('article.name')}}
      <span style="color: #ff4552">*</span></div>

    {const slotOfg_text_field = {
      append-inner: () => <>,<g-icon style="cursor: pointer" onClick={dialog.showTextKbd = true}>icon-keyboard</g-icon>,</>
    }
    }
    <g-text-field model-value={selectedProductLayout.text} onUpdate:modelvalue={debounceUpdateTextLayout('text', $event)} v-slots={slotOfg_text_field}>
    </g-text-field>
  </template>
  null</div>
