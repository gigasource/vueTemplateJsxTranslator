const fs = require("fs");
const path = require("path");
const { render } = require("../index");
describe("test translator function", () => {
  it("should be able to translate html", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/div.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "<div> Hello there </div>
      "
    `);
  });

  it("should be able to translate nested tag", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/nested-div.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "<div> <p>  hello world!  </p>
      <div> 
          Hello there
          <span>  hello world!  </span>
       </div>
       </div>
      "
    `);
  });
  it("should be able to translate div v-if", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/vif.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "<div> { (1 > 2) && <div>  Something  </div>
       } 
      { (obj.name === 'hello') && <div> 
        Something
        { (1 + 1 === 2) && <div>  </div>
       } 
       </div>
       } 
       </div>
      "
    `);
  });
  it("should be able to translate vifelse", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/vifelse.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "<div> { (showFirst) ? <div> ShowFirst </div>
       :
                    ( (1 + 1 === 2) ? <div> Show second </div>
       :
                    ( (2 + 2 === 4) ? <div>  Show third </div>
       :
                    ( (2 + 2 === 4) ? <div> <div> <p>  hello </p>
       </div>
      { (1 === 1) ? <div>  world </div>
       :
                    <div>  !  </div>
       } 
       </div>
       :
                    <div>  default  </div>
       ) 
       ) 
       ) 
       } 
       </div>
      "
    `);
  });
  it("should be able to translate v-for", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/vfor.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "{_.range(0, 5).map((item, index)  => 
       <div> <span> { item } </span>
      <span> { index } </span>
      {roomObjects.map(item  => 
       <div> { (item.name === 'table1') ? <div>  { item._id}  </div>
       :
                    <div>  { item.location}  </div>
       } 
       </div>
       )} </div>
       )}"
    `);
  });
  it("should be able to translate v-slot", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/vslots.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "<div v-slots={{ 'default': () => <> <div> 
          default slot
         </div>
      <g-btn v-slots={{ 'append-inner': () => <> <img> </img>
       </>
      , 
       }}> </g-btn>
       </>, 
      'action': (toggle) => <> <button> 
          Click me!!!
         </button>
       </>
      , 
       }}> </div>
      "
    `);
  });
  it("should be able to translate attributes", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/attrs.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "<div style=\\"diplay: 'block'\\" > 
       { 
       (1===1) && 
       <g-btn big v-model={value} color={ color } small={ true } backgroudColor={  bg  } onClick={toggle} onTouch={() => doSomething()} > 
       <input onInputChange={withModifiers((v) => {update(v)}, ['prevent', 'stop'])} v-model={data} > </input>
      <input v-model={data} ref={inputData} onUpdate:modelValue={(v) => {data = v}} > </input>
       </g-btn>
       } 
       </div>
      "
    `);
  });
  it("should be able to translate text interpolation", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/text.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "<div > {items.map(item  => 
       <div > <p >  { item.name} </p>
      <p >  { item.category}</p>
      </div>
       )}</div>
      "
    `);
  });

  it("should be able to translate complex template", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/complex.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "<div class=\\"product-editor__prop-grid\\" > { (types) && <> <div> {$t('article.type')} </div>
      <g-select disabled={ !!(type && selectedProduct.id && selectedProduct.name && selectedProduct.price) } skip-search text-field-component=\\"GTextFieldBs\\" v-model={type} items={ types } onUpdate:modelvalue={changeType} >  </g-select>
       </>
       } 
      { (isProductLayout) ? <> <div> {$t('article.id')}  </div>
      <g-text-field-bs modelValue={ selectedProduct.id } onUpdate:modelvalue={(v) => {setProductInfo('id', v);debouncedUpdateProduct('id', v)}}  v-slots={{ 'append-inner': () => <> <g-icon style=\\"cursor: pointer\\" onClick={() => openDialogInfo('id')} > icon-keyboard </g-icon>
       </>
      , 
       }}> </g-text-field-bs>
      <div> {$t('article.name')} <span style=\\"color: #FF4452\\" > * </span>
       </div>
      <g-text-field-bs modelValue={ selectedProduct.name } onUpdate:modelvalue={(v) => {setProductInfo('name', v);debouncedUpdateProduct('name', v)}}  v-slots={{ 'append-inner': () => <> <g-icon style=\\"cursor: pointer\\" onClick={() => openDialogInfo('name')} > icon-keyboard </g-icon>
       </>
      , 
       }}> </g-text-field-bs>
      <div> {$t('article.price')} <span style=\\"color: #FF4452\\" > * </span>
       </div>
      <g-text-field-bs modelValue={ selectedProduct.price } onUpdate:modelvalue={(v) => {setProductInfo('price', v);debouncedUpdateProduct('price', v)}}  v-slots={{ 'append-inner': () => <> <g-icon style=\\"cursor: pointer\\" onClick={() => openDialogInfo('price')} > icon-keyboard </g-icon>
       </>
      , 
       }}> </g-text-field-bs>
      <g-switch modelValue={ selectedProduct.isModifier } onUpdate:modelvalue={(v) => {updateProduct({ isModifier: v })}} > <div style=\\"font-size: 13px\\" > {$t('article.isModifier')} </div>
       </g-switch>
       </>
       :
                    <> <div> {$t('article.name')} <span style=\\"color: #ff4552\\" > * </span>
       </div>
      <g-text-field modelValue={ selectedProductLayout.text } onUpdate:modelvalue={(v) => {debounceUpdateTextLayout('text', v)}}  v-slots={{ 'append-inner': () => <> <g-icon style=\\"cursor: pointer\\" onClick={dialog.showTextKbd = true} > icon-keyboard </g-icon>
       </>
      , 
       }}> </g-text-field>
       </>
       } 
       </div>
      "
    `);
  });
  it("", () => {
    const input = fs.readFileSync(
      path.resolve(__dirname, "__input__/edge.js"),
      "utf-8"
    );
    expect(render(input)).toMatchInlineSnapshot(`
      "<div> <div> <pos-keyboard-full> <div>  </div>
       </pos-keyboard-full>
       </div>
       </div>
      "
    `);
  });
});
