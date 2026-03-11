<template>
  <div class="admin-page" v-loading="isLoading">
    <!-- <el-card>
      <p>This is {{name}} page.</p>
    </el-card> -->
    <div class="left-box">
      <div>
        <h3>操作模式：{{mode === "variable" ? "变量模式" : "签章模式"}}</h3>
        <el-button
          style="margin: 0 15px 15px 0;"
          v-for="(item, index) in signatoryList[0].list"
          :key="index"
          type="primary"
          size="small"
          @click="addSeal(item.type, 0)"
        >设置{{ item.text }}</el-button>
        <el-button style="margin: 0 15px 15px 0;" type="primary" size="small" @click="mode = 'variable'">设置变量</el-button>
      </div>
    </div>
    <div class="pdf-box">
      <div class="pdfCol" />
    </div>
  </div>
</template>

<script>
import {
    loadPDF,
    getMousePos,
    paintReact,
    paintText
} from "@common/canvas";

export default {
    data() {
        return {
            name: "admin",
            isLoading: false,
            mode: "variable",
            originCanvas: {}, // 原始的 啥都没的那种
            prevCanvas: {}, // 上一次的canvas
            isMove: false, // 签章模式下 是否可以在div上移动鼠标画图
            signatoryListIndex: 0,
            signatoryList: [{
              index: 0,
              type: "ourSignatory",
              // subjectType: this.companyInfo.tenantType,
              signatory: "0", // 0： 我方  1：他方
              list: [
                  {type: "companySeal", text: "公司签章"},
                  // {type: "pagingSeal", text: "骑缝章"},
                  // {type: "nameSeal", text: "签名"},
                  // {type: "dateSeal", text: "日期"}
              ],
              companySeal: [],
              pagingSeal: [],
              nameSeal: [],
              dateSeal: []
          }]
        }
    },
    mounted() {
        this.loadPdf();
    },
    methods: {
        loadPdf() {
            let self = this;

            self.isLoading = true;

            loadPDF({
                el: ".pdfCol",
                fileSrc: "https://bsl-dev.gdoss.xstore.ctyun.cn/signature/templateFile/20210906025716ssss.pdf"
            }, res => {
                self.isLoading = false;

                let originPoint = "";

                // 鼠标按钮并滑动鼠标整个过程
                function mouseDownAndMove (canvas, context, moveCall) {
                    // 鼠标按下
                    canvas.addEventListener("mousedown", event => {
                        if (!self.prevCanvas[`canvas${res.index}`]) { // 没有存上一个状态的PDF的，要存一下
                            self.prevCanvas[`canvas${res.index}`] = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
                        }

                        if (!self.originCanvas[`canvas${res.index}`]) { // 没有存原始PDF的 要先存一下
                            self.originCanvas[`canvas${res.index}`] = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
                        }

                        if (self.mode === "variable") { // 变量模式
                            originPoint = getMousePos(res.canvas, event); // 获取起始点
                        }

                        canvas.addEventListener("mousemove", moveCall); // 开始移动鼠标了
                    })

                    // 鼠标抬起
                    canvas.addEventListener("mouseup", event => {
                        context.putImageData(self.prevCanvas[`canvas${res.index}`], 0, 0); // 把上一个保存的PDF状态显示出来

                        // 获取终止点，开始画矩形了
                        if (self.mode === "variable") {
                            let point = getMousePos(res.canvas, event); // 终止点

                            if (point.x !== originPoint.x && point.y !== originPoint.y) { // 判断 起始点与终止点不是同一个点
                                paintReact(originPoint, point, context); // 画矩形

                                self.addTextArr({
                                    originPoint: self.calcPoint(originPoint, point, res.scale).originPoint,
                                    endPoint: self.calcPoint(originPoint, point, res.scale).endPoint,
                                    scale: res.scale,
                                    page: res.index,
                                    value: "",
                                    oldValue: ""
                                });
                            }
                        }
                        canvas.removeEventListener("mousemove", moveCall); // 移除鼠标移动事件
                    })
                }

                mouseDownAndMove(res.canvas, res.context, event => {
                    res.context.putImageData(self.prevCanvas[`canvas${res.index}`], 0, 0)

                    let point = getMousePos(res.canvas, event);

                    if (self.mode === "variable") {
                        paintReact(originPoint, point, res.context);
                    }
                })

                if (Number(res.allPage) === Number(res.index)) { // 最后一张PDF渲染完成
                    self.$nextTick(() => {
                        // 获取canvas的父级div盒子，在盒子上进行签章的绘制
                        let divList = document.getElementsByClassName("canvas-box");

                        for (let i = 0; i <= divList.length - 1; i++) {
                            let div = divList[i];

                            div.addEventListener("mousedown", ev => {
                                let id = "";

                                let offsetX = ev.offsetX; // 距离div左边界的X轴距离

                                let offsetY = ev.offsetY; // 距离div上边界的y轴距离

                                if (navigator.userAgent.indexOf("Firefox") > -1) { // 兼容火狐浏览器
                                    id = ev.originalTarget.id;
                                    offsetX = ev.layerX;
                                    offsetY = ev.layerY;
                                } else {
                                    id = ev.toElement.id;
                                }

                                if (id === `canvas_${i + 1}`) { // 在div上的
                                    self.signatoryMouseDown({
                                        x: offsetX,
                                        y: offsetY,
                                        parentDiv: div,
                                        i
                                    });
                                } else { // 刚好在已经画好的签章上面
                                    self.mode = `${id.split("_")[1]}Seal`;

                                    self.signatoryList.forEach((item, index) => {
                                        if (`sealItem${item.index}` === id.split("_")[0]) {
                                            self.signatoryListIndex = index;
                                        }
                                    });
                                }

                                self.isMove = true;
                                div.addEventListener("mousemove", self.innerDivMouseDownAndMove); // 开始移动鼠标了
                            })

                            div.addEventListener("mouseup", ev => {
                                let id = navigator.userAgent.indexOf("Firefox") > -1 ? ev.originalTarget.id : ev.toElement.id;

                                self.signatoryMouseUp({
                                    x: self.mode === "pagingSeal" ? `${div.offsetWidth - 78}px` : document.getElementById(id).style.left,
                                    y: document.getElementById(id).style.top,
                                    elementd: id,
                                    res
                                });

                                self.isMove = false;
                                div.removeEventListener("mousemove", self.innerDivMouseDownAndMove);
                            })
                        }
                    })
                }
            })
        },
        addSeal(val, sigIndex) {
            if (val === "pagingSeal") {
                if (this.signatoryList[sigIndex].pagingSeal.length > 0) {
                    this.$message.error("我方骑缝章已存在");
                    return;
                }
            }

            let result = "";

            // this.modeList.forEach(item => {
            //     if (val === item.type) {
            //         result = item.text;
            //     }
            // });
            this.mode = val;
            this.signatoryListIndex = sigIndex;
        },
        addTextArr (obj) {
            this.$confirm("确定选中区域？", "提示", {
                type: "warning"
            }).then(() => {
                // 确定选中
                let context = document.getElementById(`canvas_${obj.page}`).getContext("2d");

                this.prevCanvas[`canvas${obj.page}`] = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
            }).catch(() => {
                // 取消选中
                let context = document.getElementById(`canvas_${obj.page}`).getContext("2d");

                context.putImageData(this.prevCanvas[`canvas${obj.page}`], 0, 0);
            })
        },
        // 计算起止点
        calcPoint(originPoint, endPoint, scale) {
            let startX = Math.min(originPoint.x, endPoint.x);

            let startY = Math.min(originPoint.y, endPoint.y);

            let endX = Math.max(originPoint.x, endPoint.x);

            let endY = Math.max(originPoint.y, endPoint.y);

            return {
                originPoint: {
                    x: Math.round(startX / scale), y: Math.round(startY / scale)
                },
                endPoint: {
                    x: Math.round(endX / scale), y: Math.round(endY / scale)
                }
            };
        },
        // 获取每种类型签章的大小
        getSealAttr(type) {
            // let text = this.signatoryList[this.signatoryListIndex].type === "ourSignatory" ? "我方" : `他方${this.signatoryList[this.signatoryListIndex].index}`;

            let text = "我方";

            return {
                offsetLeft: type === "company" ? 79 : type === "name" ? 75 : type === "date" ? 52 : 39,
                offsetTop: type === "company" ? 79 : type === "name" ? 29 : type === "date" ? 13 : 79,
                width: type === "company" ? 159 : type === "name" ? 150 : type === "date" ? 104 : 78,
                height: type === "company" ? 159 : type === "name" ? 59 : type === "date" ? 26 : 158,
                innerText: type === "company" ? `${text}公司签章` : type === "name" ? `${text}签名` : type === "date" ? `${text}日期` : `${text}骑缝章`
            };
        },
        getSealIndex () { // 新建签章的时候 获取索引；
            let index = 1;

            let obj = this.signatoryList[this.signatoryListIndex];

            if (obj && obj[this.mode].length > 0) {
                index = Number(obj[this.mode][obj[this.mode].length - 1].id.split("_")[3]) + 1;
            }
            return index;
        },
        // 签章模式下 鼠标按下的回调
        signatoryMouseDown (obj) {
            if (this.mode !== "variable") {
                if (this.mode === "pagingSeal" && this.signatoryList[this.signatoryListIndex].pagingSeal.length > 0) {
                    return;
                }

                let type = this.mode.substring(0, this.mode.length - 4);

                let index = this.getSealIndex();

                let sigIndex = this.signatoryList[this.signatoryListIndex].index;

                if (!document.getElementById(`sealItem${sigIndex}_${type}_${obj.i + 1}_${index}`)) {
                    let {
                        offsetLeft, offsetTop, width, height, innerText
                    } = this.getSealAttr(type);

                    this.createDiv({
                        id: `sealItem${sigIndex}_${type}_${obj.i + 1}_${index}`,
                        width: `${width}px`,
                        height: `${height}px`,
                        left: `${obj.x - offsetLeft}px`,
                        top: `${obj.y - offsetTop}px`,
                        innerText: `${innerText}${index}`,
                        parentDiv: obj.parentDiv
                    });
                }
            }
        },
        // 签章模式下 鼠标松开的回调
        signatoryMouseUp (obj) {
            if (this.mode !== "variable") {
                let type = this.mode.substring(0, this.mode.length - 4);

                let {
                    offsetLeft, offsetTop, innerText
                } = this.getSealAttr(type);

                let isExist = this.signatoryList[this.signatoryListIndex][this.mode].some(item => item.id.split("_")[3] === obj.elementd.split("_")[3]);

                if (isExist) { // 原先已经存在的
                    let sigIndex = this.signatoryList[this.signatoryListIndex].index;

                    this.signatoryList[this.signatoryListIndex][this.mode].forEach(item => {
                        if (item.id.split("_")[3] === obj.elementd.split("_")[3]) {
                            item.point = {
                                x: Math.round((Number(obj.x.substring(0, obj.x.length - 2)) + offsetLeft) / item.scale),
                                y: Math.round((Number(obj.y.substring(0, obj.y.length - 2)) + offsetTop) / item.scale)
                            };

                            item.pageList.forEach(k => {
                                let itemDiv = document.getElementById(`sealItem${sigIndex}_${type}_${k}_${item.id.split("_")[3]}`);

                                itemDiv.style.left = `${Number(obj.x.substring(0, obj.x.length - 2))}px`;
                                itemDiv.style.top = `${Number(obj.y.substring(0, obj.y.length - 2))}px`;
                            });
                        }
                    });
                } else {
                    if (this.mode === "pagingSeal" && this.signatoryList[this.signatoryListIndex].pagingSeal.length > 0) {
                        return;
                    }

                    let index = this.getSealIndex();

                    this.createSignatory({
                        point: {
                            x: Number(obj.x.substring(0, obj.x.length - 2)) + offsetLeft,
                            y: Number(obj.y.substring(0, obj.y.length - 2)) + offsetTop
                        },
                        allPage: obj.res.allPage,
                        scale: obj.res.scale,
                        /*index: obj.res.index,
                        context: obj.res.context,*/
                        innerDivId: obj.elementd,
                        innerText: `${innerText}${index}`
                    });
                }
            }
        },
        innerDivMouseDownAndMove(ev) {
            if (this.mode !== "variable") {
                let id = "";

                if (navigator.userAgent.indexOf("Firefox") > -1) { // 火狐浏览器
                    id = ev.originalTarget.id;
                } else {
                    id = ev.toElement.id;
                }

                if (this.mode === "pagingSeal" && this.signatoryList[this.signatoryListIndex].pagingSeal.length > 0 && id.indexOf("paging") < 0) {
                    return;
                }

                if (document.getElementById(id) && this.isMove) {
                    let innerDiv = document.getElementById(id);

                    let parentDiv = document.getElementById(`canvasBox_${id.split("_")[2]}`);

                    let range = parentDiv.getBoundingClientRect();

                    innerDiv.style.left = `${Math.round(ev.clientX - innerDiv.offsetWidth / 2 - range.left)}px`;
                    innerDiv.style.top = `${Math.round(ev.clientY - innerDiv.offsetHeight / 2 - range.top)}px`;

                    if (innerDiv.offsetLeft <= 0) {
                        innerDiv.style.left = "0px";
                    }

                    if (innerDiv.offsetTop <= 0) {
                        innerDiv.style.top = "0px";
                    }

                    if (innerDiv.offsetLeft >= parentDiv.clientWidth - innerDiv.clientWidth) {
                        innerDiv.style.left = `${parentDiv.clientWidth - innerDiv.clientWidth}px`;
                    }

                    if (innerDiv.offsetTop >= parentDiv.clientHeight - innerDiv.clientHeight - 15) {
                        innerDiv.style.top = `${parentDiv.clientHeight - innerDiv.clientHeight - 15}px`;
                    }
                }
            }
        },
        createDiv (obj) {
            let innerDiv = document.createElement("div");

            innerDiv.className = "seal-item";
            innerDiv.id = obj.id;
            innerDiv.style.width = obj.width;
            innerDiv.style.height = obj.height;
            innerDiv.style.left = obj.left;
            innerDiv.style.top = obj.top;
            innerDiv.innerText = obj.innerText;

            obj.parentDiv.appendChild(innerDiv);
        },
        createSignatory(obj) {
            this.signatoryDialogData = {
                ...obj,
                pageList: [],
                value: obj.innerText,
                locationType: ""
            };
            this.isEditSeal = false;
            this.signatoryDialogVisible = true;
        },
    }
}
</script>

<style scoped lang="less">
.admin-page {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}
.left-box {
  width: 300px;
  flex-shrink: 0;
}
.pdf-box {
  max-height: 98vh;
  overflow: hidden;
  overflow-y: auto;
}
</style>

<style lang="less">
.pdfCol {
    height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-around;
    flex-wrap: wrap;
    box-sizing: border-box;
    padding: 0 20px;
    .canvas-box {
      position: relative;
      .seal-item {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
        border: 1px dashed #666;
        background-color: rgba(235, 247, 254, .8);
        cursor: move;
        text-align: center;
      }
    }
    .canvas {
      margin-bottom: 10px;
      border: 1px solid #333;
    }
  }
</style>
