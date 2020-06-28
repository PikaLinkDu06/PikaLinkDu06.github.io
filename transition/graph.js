// Define a set of rules for the CSS //
document.addEventListener("DOMContentLoaded",
	function(){
		var style = document.createElement('style');
		style.appendChild(document.createTextNode(""));
		document.head.appendChild(style); 
		style.sheet.insertRule('.graphstroke {stroke:var(--graphcolor); stroke-width:0.2em; vector-effect:non-scaling-stroke; stroke-linejoin:round; stroke-linecap:round;}');
		style.sheet.insertRule('html {--graphcolor:black;}');
	});

function range(x0,dx,x1) {
	size=Math.ceil((x1-x0)/dx+1.e-12);	// 1.e-12 added to include boundaries
	return [...Array(size).keys()].map(i => i*dx + x0);
}

class graph {
		// Compute the current size of the target //
	constructor(target,mywindow){// Graph window
		this.target=target;
		// Set the coordinates of the window //
		target.style.setProperty("--Xmin",mywindow[0]); target.style.setProperty("--Ymin",mywindow[1]); target.style.setProperty("--Xmax",mywindow[2]); target.style.setProperty("--Ymax",mywindow[3]);
		// Scale factors to fit drawing in the target //
		this.Xmin=mywindow[0]; this.Ymin=mywindow[1];
		this.Xmax=mywindow[2]; this.Ymax=mywindow[3];
		target.style.setProperty("--ScaleX","calc(var(--width) / ( var(--Xmax) - var(--Xmin) ))"); target.style.setProperty("--ScaleY","calc(var(--height) / ( var(--Ymin) - var(--Ymax) ))");
		var element=this;
		function setSize(){// adapt to size of the target
			if(target.style.getPropertyValue("--width")!=target.getBoundingClientRect().width){
				target.style.setProperty("--width",target.getBoundingClientRect().width);
				element.width=target.getBoundingClientRect().width;
				element.ScaleX=element.width/(element.Xmax-element.Xmin);
			}
			if(target.style.getPropertyValue("--height")!=target.getBoundingClientRect().height){
				target.style.setProperty("--height",target.getBoundingClientRect().height);
				element.height=target.getBoundingClientRect().height;
				element.ScaleY=element.height/(element.Ymin-element.Ymax);
			}
			
		}
		setSize();	// Called upon changes in the target size
		new ResizeObserver(setSize).observe(target);
		window.addEventListener("resize",setSize);
	}
	draw_axes(p={}){
	// Define axes with or without ticks and numbering
		// default setting
		var dp={
			Xmin:this.target.style.getPropertyValue("--Xmin"),
			Xmax:this.target.style.getPropertyValue("--Xmax"),
			Ymin:this.target.style.getPropertyValue("--Ymin"),
			Ymax:this.target.style.getPropertyValue("--Ymax"),
			xTicks:false,yTicks:false,
			dxTicks:1,dyTicks:1,
			lengthTicks:3,
			labels:"xy"}
		// set arguments to default settings when not given
		for(const property in dp) if (typeof p[property]==="undefined") p[property]=dp[property];
		var axes=document.createElementNS("http://www.w3.org/2000/svg", 'g');this.target.appendChild(axes);
		{
			////////////////////////////////////////////////
			//<g> (Axes)
			//	<g> (xaxe,yaxes)
			//		<g> (xTicks)
			//			<line> (Lx)
			//			[<line>]* (tick)
			//		</g>
			//		[<text>]* (nb)
			//	</g>
			//<g> 
			////////////////////////////////////////////////
			axes.style.setProperty("transition","inherit");
			var xaxe=document.createElementNS("http://www.w3.org/2000/svg", 'g');
			{
				axes.appendChild(xaxe);
				xaxe.style.setProperty("transition","inherit"); xaxe.style.setProperty("--xmin",p.Xmin); xaxe.style.setProperty("--xmax",p.Xmax);xaxe.style.setProperty("text-anchor","middle");
				xaxe.setAttribute("vector-effect","non-scaling-stroke");
				var xTicks=document.createElementNS("http://www.w3.org/2000/svg", 'g');
				{
					xaxe.appendChild(xTicks);
					xTicks.style.setProperty("transition","inherit");
					xTicks.style.setProperty("transform","matrix(calc(var(--ScaleX) * ( var(--xmax) - var(--xmin) ) * 0.5),0,0,-1,calc(var(--ScaleX) * var(--Xmin) * -1 + var(--ScaleX) * ( var(--xmax) + var(--xmin) ) * 0.5 ),calc(-1 * var(--ScaleY) * var(--Ymax)))");
					var Lx=document.createElementNS("http://www.w3.org/2000/svg", 'line');
					{
						xTicks.appendChild(Lx);
						Lx.style.setProperty("transition","inherit");Lx.style.setProperty("vector-effect","non-scaling-stroke");
						Lx.setAttribute("x1",-1);Lx.setAttribute("y1",0); Lx.setAttribute("x2",1);Lx.setAttribute("y2",0);
					}
					// on ajoute les tick si nécessaire
					let imin=Math.ceil(p.Xmin/p.dxTicks-1.e-12);
					let imax=Math.floor(p.Xmax/p.dxTicks+1.e-12);
					if(p.xTicks) for (let i=imin;i<=imax;i++){
						let x=p.dxTicks*i;
						var tick=document.createElementNS("http://www.w3.org/2000/svg", 'line');
						{
							xTicks.appendChild(tick);
							tick.style.setProperty("transition","inherit");
							tick.setAttribute("x1",2.*(x-p.Xmin) / (p.Xmax-p.Xmin) - 1);tick.setAttribute("y1",0);
							tick.setAttribute("x2",2.*(x-p.Xmin) / (p.Xmax-p.Xmin) - 1);tick.setAttribute("y2",p.lengthTicks);
							tick.setAttribute("vector-effect","non-scaling-stroke");
						}
						// Numbering the ticks
						if(p.labels.indexOf("x")>-1){
							var nb=document.createElementNS("http://www.w3.org/2000/svg","text");
							{
								xaxe.appendChild(nb);
								nb.style.setProperty("transition","inherit");nb.style.setProperty("alignment-baseline","hanging"); nb.style.setProperty("font-size","2em"); nb.style.setProperty("stroke","none"); 
								nb.style.setProperty("transform",
									"translateX(calc((var(--ScaleX) * var(--Xmin) * -1 + var(--ScaleX) * ( var(--xmax) + var(--xmin) ) * 0.5 + var(--ScaleX) * "+(2.*(x-p.Xmin) / (p.Xmax-p.Xmin) - 1)+" * ( var(--xmax) - var(--xmin) ) * 0.5) * 1px)) "+
									"translateY(calc(-1 * var(--ScaleY) * var(--Ymax) * 1px + 0.2em))");
								nb.setAttribute("x",0);nb.setAttribute("y",0);nb.textContent=x;
							}
						}
					}
				}
			}
			var yaxe=document.createElementNS("http://www.w3.org/2000/svg", 'g');
			{
				axes.appendChild(yaxe);
				yaxe.style.setProperty("transition","inherit");yaxe.style.setProperty("--ymin",p.Ymin); yaxe.style.setProperty("--ymax",p.Ymax); yaxe.style.setProperty("text-anchor","end");
				yaxe.setAttribute("vector-effect","non-scaling-stroke"); var yTicks=document.createElementNS("http://www.w3.org/2000/svg", 'g');yaxe.appendChild(yTicks);
				{
					yTicks.style.setProperty("transition","inherit");
					yTicks.style.setProperty("transform"," matrix(1,0,0,calc( var(--ScaleY) * ( var(--ymax) - var(--ymin) ) * 0.5),calc(var(--ScaleX) * var(--Xmin) * -1  ),calc(-1 * var(--ScaleY) * var(--Ymax) + var(--ScaleY) * ( var(--ymax) + var(--ymin) ) * 0.5)) ");
					var Ly=document.createElementNS("http://www.w3.org/2000/svg", 'line');
					{
						yTicks.appendChild(Ly);
						Ly.style.setProperty("transition","inherit");Ly.style.setProperty("vector-effect","non-scaling-stroke");
						Ly.setAttribute("x1",0);Ly.setAttribute("y1",-1); Ly.setAttribute("x2",0);Ly.setAttribute("y2",1);
					}
					let imin=Math.ceil(p.Ymin/p.dyTicks-1.e-12);
					let imax=Math.floor(p.Ymax/p.dyTicks+1.e-12);
					if(p.yTicks) for (let i=imin;i<=imax;i++)
					{
						let y=p.dyTicks*i;
						var tick=document.createElementNS("http://www.w3.org/2000/svg", 'line');
						{
							tick.setAttribute("x1",0);tick.setAttribute("y1",2.*(y-p.Ymin)/(p.Ymax-p.Ymin) -1);
							tick.setAttribute("x2",p.lengthTicks);tick.setAttribute("y2",2.*(y-p.Ymin)/(p.Ymax-p.Ymin)-1);
							tick.setAttribute("vector-effect","non-scaling-stroke");
							yTicks.appendChild(tick);
						}
						// Numbering the ticks
						if(p.labels.indexOf("y")>-1){
							var nb=document.createElementNS("http://www.w3.org/2000/svg","text");
							{
								yaxe.appendChild(nb);
								nb.style.setProperty("transition","inherit");nb.style.setProperty("alignment-baseline","middle"); nb.style.setProperty("font-size","2em"); nb.style.setProperty("stroke","none"); 
								nb.style.setProperty("transform",
								"translateY(calc((var(--ScaleY) * (-1 * var(--Ymax) - ( var(--ymax) + var(--ymin) ) * 0.5 + "+(2.*(y-p.Ymin) / (p.Ymax-p.Ymin) - 1)+"* ( var(--ymax) - var(--ymin) ) * 0.5) ) * 1px)) "+
	"translateX(calc(var(--ScaleX) * var(--Xmin) * -1px - 0.2em))");
								nb.setAttribute("x",0);nb.setAttribute("y",0);nb.textContent=y;
							}
						}
					}
				}
			}
		}
		axes.classList.add('graphstroke');
		return axes
	}
	plotXY(p={}){
		// default setting
		var dp={
			f:function(){return [0,0]},
			domain:[0,1],
			N:100
		}
		for(const property in dp){
			if (typeof p[property]==="undefined") {
				p[property]=dp[property];
			}
		}
		/* Draw aCurve */
		var tmin=p.domain[0];var tmax=p.domain[1];
		if(tmin>tmax){
			let inter=xmin;xmin=xmax;xmax=inter;}
		var polyline=document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
			polyline.setAttribute("stroke-linejoin","round");
			polyline.setAttribute("stroke-linecap","round");
			polyline.setAttribute("fill","none");
			polyline.setAttribute("vector-effect","non-scaling-stroke");
			polyline.style.setProperty("transition","inherit");
			polyline.style.setProperty("transform","matrix(var(--ScaleX),0,0,var(--ScaleY),calc(var(--ScaleX) * var(--Xmin) * -1),calc(-1 * var(--ScaleY) * var(--Ymax)))");
				//calc(-1 * var(--Xmin)),var(--Ymin))");
		var points="";
		var dt=(tmax-tmin)/(p.N+1);
		if(dt==0){
			points=p.f(tmin)[0]+","+p.f(tmin)[1]+" "+(tmax)[0]+","+p.f(tmax)[1]+" ";
		}
		else
			for(var t=tmin;t<=tmax+dt/2.;t+=dt) {
				let newpt=p.f(t);
				points=points+newpt[0]+","+newpt[1]+" ";
			}
		polyline.setAttribute("points",points);
		//var curve=document.createElementNS("http://www.w3.org/2000/svg", 'g'); // The idea was not to male the attribute directly available... but the behavior on transition is not what is expected (delay between multiple transitions)
		//curve.appendChild(polyline);
		var curve=polyline;
		this.target.appendChild(curve);

		//curve.style.setProperty("transition","inherit");
		curve.classList.add('graphstroke');
		return curve;
	}
	plot(p={}){
		// default setting
		var dp={
			f:function(){return 0},
			domain:[parseFloat(this.target.style.getPropertyValue("--Xmin")),
				parseFloat(this.target.style.getPropertyValue("--Xmax"))],
			N:100
		}
		for(const property in dp){
			if (typeof p[property]==="undefined") {
				p[property]=dp[property];
			}
		}
		/* Draw aCurve */
		var xmin=p.domain[0];var xmax=p.domain[1];
		if(xmin>xmax){
			let inter=xmin;xmin=xmax;xmax=inter;}
		var polyline=document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
			polyline.setAttribute("stroke-linejoin","round");
			polyline.setAttribute("stroke-linecap","round");
			polyline.setAttribute("fill","none");
			polyline.setAttribute("vector-effect","non-scaling-stroke");
			polyline.style.setProperty("transition","inherit");
			polyline.style.setProperty("transform","matrix(var(--ScaleX),0,0,var(--ScaleY),calc(var(--ScaleX) * var(--Xmin) * -1),calc(-1 * var(--ScaleY) * var(--Ymax)))");
				//calc(-1 * var(--Xmin)),var(--Ymin))");
		var points="";
		var dx=(xmax-xmin)/(p.N+1);
		if(dx==0){
			points=xmin+","+p.f(xmin)+" "+xmax+","+p.f(xmax)+" ";
		}
		else
			for(var x=xmin;x<=xmax+dx/2.;x+=dx) points=points+x+","+p.f(x)+" ";
		polyline.setAttribute("points",points);
		//var curve=document.createElementNS("http://www.w3.org/2000/svg", 'g'); // The idea was not to male the attribute directly available... but the behavior on transition is not what is expected (delay between multiple transitions)
		//curve.appendChild(polyline);
		var curve=polyline;
		this.target.appendChild(curve);

		//curve.style.setProperty("transition","inherit");
		curve.classList.add('graphstroke');
		return curve;
	}
	dot(x,y){
		// 0 radius circle are not displayed (that a shame)
		var circle=document.createElementNS("http://www.w3.org/2000/svg", 'line');
		circle.setAttribute("fill","none");
		circle.setAttribute("vector-effect","non-scaling-stroke");
		circle.style.setProperty("transition","inherit");
		circle.style.setProperty("transform","matrix(var(--ScaleX),0,0,var(--ScaleY),calc(var(--ScaleX) * var(--Xmin) * -1),calc(-1 * var(--ScaleY) * var(--Ymax)))");
		circle.setAttribute("x1",x);
		circle.setAttribute("x2",x);
		circle.setAttribute("y1",y);
		circle.setAttribute("y2",y);
		circle.setAttribute("stroke-linecap","round");
		circle.classList.add('graphstroke');
		this.target.append(circle);
		return circle
		//return this.plot({f:function(){return y},domain:[x,x]});
	}
	line(x1,y1,x2,y2){
		// 0 radius circle are not displayed (that a shame)
		var line=document.createElementNS("http://www.w3.org/2000/svg", 'line');
		line.setAttribute("fill","none");
		line.setAttribute("vector-effect","non-scaling-stroke");
		line.style.setProperty("transition","inherit");
		line.style.setProperty("transform","matrix(var(--ScaleX),0,0,var(--ScaleY),calc(var(--ScaleX) * var(--Xmin) * -1),calc(-1 * var(--ScaleY) * var(--Ymax)))");
		line.setAttribute("x1",x1);
		line.setAttribute("x2",x2);
		line.setAttribute("y1",y1);
		line.setAttribute("y2",y2);
		line.setAttribute("stroke-linecap","round");
		
		line.classList.add('graphstroke');
		this.target.append(line);
		return line
		//return this.plot({f:function(){return y},domain:[x,x]});
	}
	getX(x){
		return (x-this.Xmin)*this.ScaleX;
		//return "calc(( "+x+" - var(--Xmin)) * var(--ScaleX))";
		
		//(x-parseFloat(this.target.style.getPropertyValue("--Xmin")))*parseFloat(this.target.style.getPropertyValue("--ScaleX"))x);
	}
	getY(y){
		return (y-this.Ymax)*this.ScaleY;
		//return "calc((var(--Ymax) - "+y+") * var(--ScaleY))";
		//return (parseFloat(this.target.style.getPropertyValue("--Ymax"))-y)*parseFloat(this.target.style.getPropertyValue("--ScaleY"));
	}
	/*
	drawXY(fx,fy,domain,N,style){
		// Draw aCurve 
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
	*/
}
/* define arrow 
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
}*/
