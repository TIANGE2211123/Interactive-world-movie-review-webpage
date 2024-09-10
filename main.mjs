'use strict';

import * as d3 from 'd3';

import csv1 from './assets/value.csv';
import {_chart,_graph} from './sankey.js';


// 使用 d3.csv 导入数据
d3.csv(csv1).then((data, error) => {
  if (error) {
    console.log(error);
  } else {
    data.forEach(d =>{
      d['value'] = +(d['value']);
     } )
    // 调用 _graph 函数处理数据
    const graph = _graph(data, d3);
    // 调用 _chart 函数绘制图表
    _chart(d3, graph);
  }
});


