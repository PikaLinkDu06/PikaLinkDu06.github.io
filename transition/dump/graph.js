class graph {
				constructor(target,window){
					this.Xmin=window[0];this.Ymin=window[1];
					this.Xmax=window[2];this.Ymax=window[3];
					this.width=target.getBoundingClientRect().width; 
					this.height=target.getBoundingClientRect().height;
					this.ScaleX=this.width/(this.Xmax-this.Xmin);
					this.ScaleY=this.height/(this.Ymax-this.Ymin);
					this.target=target;
					target.setAttribute("viewBox","0 0 "+this.width+" "+this.height);
				}
				draw_axes(strokeWidth,ticks=false){
					/* Axes */
					var xaxes=document.createElementNS("http://www.w3.org/2000/svg", 'line');
					var yaxes=document.createElementNS("http://www.w3.org/2000/svg", 'line');
					xaxes.setAttribute("marker-end","url(#graphArrow)");
					xaxes.setAttribute("style","stroke:white; stroke-width:"+strokeWidth+";");
					xaxes.setAttribute("vector-effect","non-scaling-stroke");
					yaxes.setAttribute("marker-end","url(#graphArrow)");
					yaxes.setAttribute("style","stroke:white; stroke-width:"+strokeWidth+";");
					yaxes.setAttribute("vector-effect","non-scaling-stroke");

					xaxes.setAttribute("x1",0);xaxes.setAttribute("y1",this.Ymax*this.ScaleY);
					xaxes.setAttribute("x2",this.width);xaxes.setAttribute("y2",this.Ymax*this.ScaleY);
					
					yaxes.setAttribute("x1",-this.Xmin*this.ScaleX);yaxes.setAttribute("y1",this.height);
					yaxes.setAttribute("x2",-this.Xmin*this.ScaleX);yaxes.setAttribute("y2",0);
					/*
					if(ticks) {
						for(let n=Math.ceil(this.Xmin);n<this.Xmax;n++){
							var tick=document.createElementNS("http://www.w3.org/2000/svg", 'line');
							tick.setAttribute("x1",n*this.ScaleX);xaxes.setAttribute("y1",0);
							tick.setAttribute("style","stroke:white; stroke-width:"+strokeWidth+";");
							tick.setAttribute("x2",n*this.ScaleX);xaxes.setAttribute("y2",10*strokeWidth);
							this.target.appendChild(tick);
						}
					}*/
					this.target.appendChild(xaxes);this.target.appendChild(yaxes);
				}
				draw(f,domain,N,style,classes="",id=""){
					/* Draw aCurve */
					var xmin=domain[0];var xmax=domain[1];
					var polyline=document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
						polyline.setAttribute("style",style);
						polyline.setAttribute("stroke-linejoin","round");
						polyline.setAttribute("stroke-linecap","round");
						polyline.setAttribute("fill","none");
						polyline.setAttribute("vector-effect","non-scaling-stroke");
					var points="";
					var dx=(xmax-xmin)/(N+1);
					for(var x=xmin;x<=xmax;x+=dx){
						points=points+(x-this.Xmin)*this.ScaleX+","+((this.Ymax-f(x))*this.ScaleY)+" "
					}
					polyline.setAttribute("points",points);
					polyline.setAttribute("id",id);
					if(classes!="") polyline.classList.add(classes);
					this.target.appendChild(polyline);
					return polyline;
				}
				drawXY(fx,fy,domain,N,style){
					/* Draw aCurve */
					var tmin=domain[0];var tmax=domain[1];
					var polyline=document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
						polyline.setAttribute("style",style);
						polyline.setAttribute("stroke-linejoin","round");
						polyline.setAttribute("stroke-linecap","round");
						polyline.setAttribute("fill","none");
						polyline.setAttribute("vector-effect","non-scaling-stroke");
					var points="";
					var dt=(tmax-tmin)/(N+1);
					for(var t=tmin;t<=tmax;t+=dt){
						points=points+(fx(t)-this.Xmin)*this.ScaleX+","+((this.Ymax-fy(t))*this.ScaleY)+" "
					}
					polyline.setAttribute("points",points);
					this.target.appendChild(polyline);
					return polyline;
				}
				getX(x){
					return (x-this.Xmin)*this.ScaleX
				}
				getY(y){
					return (this.Ymax-y)*this.ScaleY;
				}
			}
/* define arrow */
{
	var graphArrow=document.createElementNS("http://www.w3.org/2000/svg","svg");
	var defs=document.createElementNS("http://www.w3.org/2000/svg","defs");
	var marker=document.createElementNS("http://www.w3.org/2000/svg","marker");
	marker.setAttributeNS(null,"id","graphArrow");
	marker.setAttributeNS(null,"viewBox","-9 -3 9 6");
	marker.setAttributeNS(null,"orient","auto");
	marker.setAttributeNS(null,"markerUnits","strokeWidth");
	marker.setAttributeNS(null,"markerHeight","12");
	marker.setAttributeNS(null,"markerWidth","18");
	var path=document.createElementNS("http://www.w3.org/2000/svg","path");
	path.setAttributeNS(null,"d","M0,0 L-9,3 L-9,-3 z");
	path.setAttributeNS(null,"fill","white");
	marker.appendChild(path);
	marker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "http://www.w3.org/1999/xlink");
	defs.appendChild(marker);
	graphArrow.appendChild(defs);
	document.getElementsByTagName('body')[0].appendChild(graphArrow);
}
