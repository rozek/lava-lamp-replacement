const { cuboid, cylinder } = require('@jscad/modeling').primitives
const { translate } = require('@jscad/modeling').transforms
const { subtract }  = require('@jscad/modeling').booleans

const outerDiameter  = 100, outerRadius = outerDiameter/2
const WallThickness  = 2.6
const ThicknessExtra = 0.4            // to compensate for imprecise 3d printers

const BaseHeight   = 10, halfBaseHeight = BaseHeight/2
const GrooveDepth = 3

const main = () => {

/**** base height: 4mm cable diameter + 3mm groove depth ****/

  let Base = translate([0,0,halfBaseHeight],
    cylinder({ radius:outerRadius + halfBaseHeight, height:BaseHeight, segments:72 }))

/**** 3mm deep groove ****/

  const outerGrooveRadius = outerRadius + ThicknessExtra
  const innerGrooveRadius = outerRadius - WallThickness - ThicknessExtra

  let Groove = translate([0,0,BaseHeight-GrooveDepth/2], subtract(
    cylinder({ radius:outerGrooveRadius, height:GrooveDepth+1, segments:72 }),
    cylinder({ radius:innerGrooveRadius, height:GrooveDepth+1, segments:72 })
  ))                                // 1mm extra to safely cut groove out of lid

/**** cable channel: 4mm diameter, below glass groove ****/

  const CableDiameter = 4
  const ChannelLength = 20
  const HoleWidth = 7, HoleDepth = 11             // depends on size of USB plug

  const outerY = -outerRadius-halfBaseHeight

  let Channel = translate([0,outerY + ChannelLength/2-1,CableDiameter/2],
    cuboid({ size:[CableDiameter,ChannelLength,CableDiameter+0.2] })) // 1mm extra
  let Hole = translate([0,outerY + ChannelLength + HoleDepth/2-1,BaseHeight/2+1],
    cuboid({ size:[HoleWidth,HoleDepth,BaseHeight+2] }))

/**** result ****/

  return subtract(Base,Groove,Channel,Hole)
}

module.exports = { main }