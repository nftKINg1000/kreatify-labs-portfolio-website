import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Composition } from 'remotion';

type Variant = 'forma' | 'website';
const palette = {
  forma: {bg: '#F6F7F1',fg:'#173D2B',accent:'#245740',sub:'#66786C',card:'#FFFFFF'},
  website: {bg:'#0B0D11',fg:'#F5F7F1',accent:'#D1E970',sub:'#9B9EA4',card:'#171B21'},
};
const font = 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
export const Showcase: React.FC<{variant:Variant}> = ({variant}) => {
 const frame = useCurrentFrame();
 const {fps}= useVideoConfig();
 const t = frame/fps;
 const c = palette[variant];
 const slide = interpolate(frame,[8,40],[160,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const opacity = interpolate(frame,[8,26],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const outro = interpolate(frame,[144,165],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const web = variant==='website';
 return <AbsoluteFill style={{background:c.bg,color:c.fg,fontFamily:font,overflow:'hidden',padding:'92px 58px'}}>
  <div style={{fontSize:22,fontWeight:700,letterSpacing:2,color:c.sub}}>KREATIFY / {web?'PROJECT 02':'PROJECT 01'}</div>
  <div style={{fontSize: web?92:104,fontWeight:800,letterSpacing:-6,lineHeight:1.02,marginTop:62}}>{web?<>DIGITAL<br/><span style={{color:c.accent}}>CRAFT.</span></>:<>FORMA<span style={{color:c.accent}}>.</span></>}</div>
  <div style={{fontSize:22,fontWeight:700,letterSpacing:1.4,color:c.sub,marginTop:34}}>{web?'REACT / TYPESCRIPT / THREE.JS':'REACT NATIVE / EXPO / TYPESCRIPT'}</div>
  <div style={{position:'absolute',top:450,left:75,right:75,height:640,opacity,transform:`translateY(${slide}px)`,background:web?'#F7F8F3':'#FFFFFF',border:web?'13px solid #1F252A':'15px solid #1D2B24',borderRadius:web?32:62,padding:'50px 42px',boxShadow:'0 36px 95px #00000019'}}>
   <div style={{fontSize:36,fontWeight:850,color:'#20432E'}}>{web?'KREATIFY':'forma.'}</div>
   <div style={{fontSize:web?53:49,fontWeight:800,color:'#23362C',lineHeight:1.07,letterSpacing:-2,marginTop:55}}>{web?<>WE BUILD<br/>WHAT'S NEXT.</>:<>Money, made<br/>simple.</>}</div>
   <div style={{background:web?'#E2E7DC':'#245740',borderRadius:30,padding:28,marginTop:55,minHeight:180,color:web?'#24432E':'white'}}>
    <div style={{fontSize:18,letterSpacing:2,fontWeight:700}}>{web?'INTERACTIVE WEB EXPERIENCE':'TOTAL AVAILABLE'}</div>
    <div style={{fontSize:42,fontWeight:800,marginTop:30}}>{web?'Design in motion':'$14,188.00'}</div>
   </div>
   <div style={{marginTop:45,fontSize:24,color:'#50675A',fontWeight:700}}>{web?'React • Motion • WebGL':'Your goals  •  70% saved'}</div>
  </div>
  <AbsoluteFill style={{background:web?'#10141B':'#245740',opacity:outro,alignItems:'flex-start',justifyContent:'center',padding:65}}>
   <div style={{fontWeight:850,fontSize:74,letterSpacing:-3,lineHeight:1.13,color:'white'}}>{web?<>Interfaces<br/>with intent.</>:<>Build beyond<br/>the prototype.</>}</div>
   <div style={{fontSize:23,letterSpacing:1.6,marginTop:42,color:web?'#D1E970':'#D5E8D9'}}>{web?'REACT / MOTION / WEBGL':'REACT NATIVE / EXPO'}</div>
   <div style={{position:'absolute',bottom:180,fontSize:18,color:'#CBD6CD'}}>ORIGINAL PORTFOLIO SHOWCASE</div>
  </AbsoluteFill>
  <div style={{position:'absolute',bottom:80,left:60,right:60,height:6,background:web?'#30363C':'#D8DFD4',borderRadius:8}}>
   <div style={{height:6,width:`${frame/215*100}%`,background:c.accent,borderRadius:8}}/>
  </div>
 </AbsoluteFill>;
};
export const PortfolioCompositions=()=><>
 <Composition id="FormaFinance" component={Showcase} defaultProps={{variant:'forma' as Variant}} durationInFrames={216} fps={24} width={720} height={1280}/>
 <Composition id="KreatifyWeb" component={Showcase} defaultProps={{variant:'website' as Variant}} durationInFrames={216} fps={24} width={720} height={1280}/>
</>;
