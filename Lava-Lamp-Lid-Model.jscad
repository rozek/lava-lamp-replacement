const { cylinder, torus } = require('@jscad/modeling').primitives
const { translate }       = require('@jscad/modeling').transforms
const { union, subtract } = require('@jscad/modeling').booleans

const outerDiameter  = 100, outerRadius = outerDiameter/2
const WallThickness  = 2.6
const ThicknessExtra = 0.4            // to compensate for imprecise 3d printers

const LidHeight   = 10, halfLidHeight = LidHeight/2
const GrooveDepth = 3

const main = () => {
  let Lid = union(
    translate([0,0,halfLidHeight],
      cylinder({ radius:outerRadius, height:LidHeight, segments:72 })),
    translate([0,0,halfLidHeight],
      torus({ outerRadius:outerRadius, innerRadius:halfLidHeight, outerSegments:72 })),
    translate([0,0,halfLidHeight/2],
      cylinder({ radius:outerRadius+halfLidHeight, height:halfLidHeight, segments:72 }))
  )

  Lid = subtract(
    Lid,
    translate([0,0,-halfLidHeight],
      cylinder({ radius:outerRadius+1, height:5, segments:72 }))
  )            // 1mm extra to safely cut off any unnecessary parts of the model

/**** 3mm deep groove ****/

  const outerGrooveRadius = outerRadius + ThicknessExtra
  const innerGrooveRadius = outerRadius - WallThickness - ThicknessExtra

  let Groove = translate([0,0,GrooveDepth/2], subtract(
    cylinder({ radius:outerGrooveRadius, height:GrooveDepth+1, segments:72 }),
    cylinder({ radius:innerGrooveRadius, height:GrooveDepth+1, segments:72 })
  ))                                // 1mm extra to safely cut groove out of lid

/**** result ****/

  return subtract(Lid,Groove)
}

module.exports = { main }