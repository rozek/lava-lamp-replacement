const { cuboid, cylinder } = require('@jscad/modeling').primitives
const { translate }        = require('@jscad/modeling').transforms
const { union, subtract }  = require('@jscad/modeling').booleans

const outerDiameter  = 85,              outerRadius = outerDiameter/2
const innerDiameter  = outerDiameter-6, innerRadius = innerDiameter/2
const HoleDiameter   = innerDiameter-4, HoleRadius  = HoleDiameter/2

const BaseHeight   = 5,  halfBaseHeight   = BaseHeight/2
const ShieldHeight = 10, halfShieldHeight = ShieldHeight/2
const HoleHeight   = 50

const GrooveThickness = 1, GrooveDepth = 4

const main = () => {
  let Ring = union(
    translate([0,0,halfBaseHeight],
      cylinder({ radius:outerRadius, height:BaseHeight, segments:36 })),
    translate([0,0,halfShieldHeight + BaseHeight],
      cylinder({ radius:innerRadius, height:ShieldHeight, segments:36 })),
  )

  Ring = subtract(
    Ring,
    cylinder({ radius:HoleRadius, height:HoleHeight, segments:36 })
  )

  let Groove = translate([0,0,BaseHeight-GrooveDepth/2], subtract(
    cylinder({ radius:innerRadius + GrooveThickness, height:GrooveDepth, segments:36 }),
    cylinder({ radius:innerRadius, height:GrooveDepth, segments:36 })
  ))

  return subtract(Ring,Groove)
}

module.exports = { main }