import { DnaBodyPartInfo } from "../type";

function parseLegendary(e) {
  return {
    l_head: 0 < (1 & e) ? 1 : 0,
    l_face: 0 < (2 & e) ? 1 : 0,
    l_body: 0 < (4 & e) ? 1 : 0,
    l_arm: 0 < (8 & e) ? 1 : 0,
    l_accessory: 0 < (16 & e) ? 1 : 0,
    l_leg: 0 < (32 & e) ? 1 : 0,
    l_tail: 0 < (64 & e) ? 1 : 0,
  };
}

export function parseDnaToBodyPart(e): DnaBodyPartInfo {
  if (!/^[0-9A-Fa-f]{64}$/g.test(e)) throw new Error("INVALID_DNA");

  let r = new RegExp(
      "^(?<d_head_class>.{1})(?<d_head_type>.{1})(?<r1_head_class>.{1})(?<r1_head_type>.{1})(?<r2_head_class>.{1})(?<r2_head_type>.{1})(?<r3_head_class>.{1})(?<r3_head_type>.{1})(?<d_face_class>.{1})(?<d_face_type>.{1})(?<r1_face_class>.{1})(?<r1_face_type>.{1})(?<r2_face_class>.{1})(?<r2_face_type>.{1})(?<r3_face_class>.{1})(?<r3_face_type>.{1})(?<d_body_class>.{1})(?<d_body_type>.{1})(?<r1_body_class>.{1})(?<r1_body_type>.{1})(?<r2_body_class>.{1})(?<r2_body_type>.{1})(?<r3_body_class>.{1})(?<r3_body_type>.{1})(?<d_arm_class>.{1})(?<d_arm_type>.{1})(?<r1_arm_class>.{1})(?<r1_arm_type>.{1})(?<r2_arm_class>.{1})(?<r2_arm_type>.{1})(?<r3_arm_class>.{1})(?<r3_arm_type>.{1})(?<d_accessory_class>.{1})(?<d_accessory_type>.{1})(?<r1_accessory_class>.{1})(?<r1_accessory_type>.{1})(?<r2_accessory_class>.{1})(?<r2_accessory_type>.{1})(?<r3_accessory_class>.{1})(?<r3_accessory_type>.{1})(?<d_leg_class>.{1})(?<d_leg_type>.{1})(?<r1_leg_class>.{1})(?<r1_leg_type>.{1})(?<r2_leg_class>.{1})(?<r2_leg_type>.{1})(?<r3_leg_class>.{1})(?<r3_leg_type>.{1})(?<d_tail_class>.{1})(?<d_tail_type>.{1})(?<r1_tail_class>.{1})(?<r1_tail_type>.{1})(?<r2_tail_class>.{1})(?<r2_tail_type>.{1})(?<r3_tail_class>.{1})(?<r3_tail_type>.{1})(?<legendary>.{2})(?<reserved>.{6})$"
    ),
    t = e.match(r),
    a = t.groups;

  (a.legendary = Number("0x" + a.legendary)),
    (e = parseLegendary(a.legendary)),
    (a.l_head = e.l_head),
    (a.l_face = e.l_face),
    (a.l_body = e.l_body),
    (a.l_arm = e.l_arm),
    (a.l_accessory = e.l_accessory),
    (a.l_leg = e.l_leg),
    (a.l_tail = e.l_tail),
    (a.species_type = Number("0x" + a.d_head_class)),
    (a.reserved = Number("0x" + a.reserved)),
    (a.d_head_class = Number("0x" + a.d_head_class)),
    (a.d_head_type = Number("0x" + a.d_head_type)),
    (a.r1_head_class = Number("0x" + a.r1_head_class)),
    (a.r1_head_type = Number("0x" + a.r1_head_type)),
    (a.r2_head_class = Number("0x" + a.r2_head_class)),
    (a.r2_head_type = Number("0x" + a.r2_head_type)),
    (a.r3_head_class = Number("0x" + a.r3_head_class)),
    (a.r3_head_type = Number("0x" + a.r3_head_type)),
    (a.d_face_class = Number("0x" + a.d_face_class)),
    (a.d_face_type = Number("0x" + a.d_face_type)),
    (a.r1_face_class = Number("0x" + a.r1_face_class)),
    (a.r1_face_type = Number("0x" + a.r1_face_type)),
    (a.r2_face_class = Number("0x" + a.r2_face_class)),
    (a.r2_face_type = Number("0x" + a.r2_face_type)),
    (a.r3_face_class = Number("0x" + a.r3_face_class)),
    (a.r3_face_type = Number("0x" + a.r3_face_type)),
    (a.d_body_class = Number("0x" + a.d_body_class)),
    (a.d_body_type = Number("0x" + a.d_body_type)),
    (a.r1_body_class = Number("0x" + a.r1_body_class)),
    (a.r1_body_type = Number("0x" + a.r1_body_type)),
    (a.r2_body_class = Number("0x" + a.r2_body_class)),
    (a.r2_body_type = Number("0x" + a.r2_body_type)),
    (a.r3_body_class = Number("0x" + a.r3_body_class)),
    (a.r3_body_type = Number("0x" + a.r3_body_type)),
    (a.d_arm_class = Number("0x" + a.d_arm_class)),
    (a.d_arm_type = Number("0x" + a.d_arm_type)),
    (a.r1_arm_class = Number("0x" + a.r1_arm_class)),
    (a.r1_arm_type = Number("0x" + a.r1_arm_type)),
    (a.r2_arm_class = Number("0x" + a.r2_arm_class)),
    (a.r2_arm_type = Number("0x" + a.r2_arm_type)),
    (a.r3_arm_class = Number("0x" + a.r3_arm_class)),
    (a.r3_arm_type = Number("0x" + a.r3_arm_type)),
    (a.d_accessory_class = Number("0x" + a.d_accessory_class)),
    (a.d_accessory_type = Number("0x" + a.d_accessory_type)),
    (a.r1_accessory_class = Number("0x" + a.r1_accessory_class)),
    (a.r1_accessory_type = Number("0x" + a.r1_accessory_type)),
    (a.r2_accessory_class = Number("0x" + a.r2_accessory_class)),
    (a.r2_accessory_type = Number("0x" + a.r2_accessory_type)),
    (a.r3_accessory_class = Number("0x" + a.r3_accessory_class)),
    (a.r3_accessory_type = Number("0x" + a.r3_accessory_type)),
    (a.d_leg_class = Number("0x" + a.d_leg_class)),
    (a.d_leg_type = Number("0x" + a.d_leg_type)),
    (a.r1_leg_class = Number("0x" + a.r1_leg_class)),
    (a.r1_leg_type = Number("0x" + a.r1_leg_type)),
    (a.r2_leg_class = Number("0x" + a.r2_leg_class)),
    (a.r2_leg_type = Number("0x" + a.r2_leg_type)),
    (a.r3_leg_class = Number("0x" + a.r3_leg_class)),
    (a.r3_leg_type = Number("0x" + a.r3_leg_type)),
    (a.d_tail_class = Number("0x" + a.d_tail_class)),
    (a.d_tail_type = Number("0x" + a.d_tail_type)),
    (a.r1_tail_class = Number("0x" + a.r1_tail_class)),
    (a.r1_tail_type = Number("0x" + a.r1_tail_type)),
    (a.r2_tail_class = Number("0x" + a.r2_tail_class)),
    (a.r2_tail_type = Number("0x" + a.r2_tail_type)),
    (a.r3_tail_class = Number("0x" + a.r3_tail_class)),
    (a.r3_tail_type = Number("0x" + a.r3_tail_type)),
    (a.species_class = getClassName(a.species_type)),
    (a.d_head_type_name = getTypeName(a.d_head_class, a.d_head_type)),
    (a.d_face_type_name = getTypeName(a.d_face_class, a.d_face_type)),
    (a.d_body_type_name = getTypeName(a.d_body_class, a.d_body_type)),
    (a.d_arm_type_name = getTypeName(a.d_arm_class, a.d_arm_type)),
    (a.d_accessory_type_name = getTypeName(
      a.d_accessory_class,
      a.d_accessory_type
    )),
    (a.d_leg_type_name = getTypeName(a.d_leg_class, a.d_leg_type)),
    (a.d_tail_type_name = getTypeName(a.d_tail_class, a.d_tail_type)),
    (a.r1_head_type_name = getTypeName(a.r1_head_class, a.r1_head_type)),
    (a.r1_face_type_name = getTypeName(a.r1_face_class, a.r1_face_type)),
    (a.r1_body_type_name = getTypeName(a.r1_body_class, a.r1_body_type)),
    (a.r1_arm_type_name = getTypeName(a.r1_arm_class, a.r1_arm_type)),
    (a.r1_accessory_type_name = getTypeName(
      a.r1_accessory_class,
      a.r1_accessory_type
    )),
    (a.r1_leg_type_name = getTypeName(a.r1_leg_class, a.r1_leg_type)),
    (a.r1_tail_type_name = getTypeName(a.r1_tail_class, a.r1_tail_type)),
    (a.r2_head_type_name = getTypeName(a.r2_head_class, a.r2_head_type)),
    (a.r2_face_type_name = getTypeName(a.r2_face_class, a.r2_face_type)),
    (a.r2_body_type_name = getTypeName(a.r2_body_class, a.r2_body_type)),
    (a.r2_arm_type_name = getTypeName(a.r2_arm_class, a.r2_arm_type)),
    (a.r2_accessory_type_name = getTypeName(
      a.r2_accessory_class,
      a.r2_accessory_type
    )),
    (a.r2_leg_type_name = getTypeName(a.r2_leg_class, a.r2_leg_type)),
    (a.r2_tail_type_name = getTypeName(a.r2_tail_class, a.r2_tail_type)),
    (a.r3_head_type_name = getTypeName(a.r3_head_class, a.r3_head_type)),
    (a.r3_face_type_name = getTypeName(a.r3_face_class, a.r3_face_type)),
    (a.r3_body_type_name = getTypeName(a.r3_body_class, a.r3_body_type)),
    (a.r3_arm_type_name = getTypeName(a.r3_arm_class, a.r3_arm_type)),
    (a.r3_accessory_type_name = getTypeName(
      a.r3_accessory_class,
      a.r3_accessory_type
    )),
    (a.r3_leg_type_name = getTypeName(a.r3_leg_class, a.r3_leg_type)),
    (a.r3_tail_type_name = getTypeName(a.r3_tail_class, a.r3_tail_type));
  let s = 1;

  a.d_head_type == a.d_body_type && s++,
    a.d_face_type == a.d_body_type && s++,
    a.d_arm_type == a.d_body_type && s++,
    a.d_accessory_type == a.d_body_type && s++,
    a.d_leg_type == a.d_body_type && s++,
    a.d_tail_type == a.d_body_type && s++,
    (a.purity = s);

  return { ...a };
}

const t = new Map(),
  a = new Map(),
  s = new Map(),
  n = new Map(),
  _ = new Map(),
  c = new Map(),
  o = new Map();
t.set(1, "Chickie"),
  t.set(2, "Rampi"),
  t.set(3, "Ri Kong"),
  t.set(4, "Bruwan"),
  t.set(5, "Calico"),
  t.set(6, "Tiga"),
  t.set(7, "Mama Puncha"),
  a.set(1, "Doo Doo"),
  a.set(2, "Lumin"),
  a.set(3, "Cancihalcon"),
  a.set(4, "Nimo"),
  a.set(5, "Hoba"),
  a.set(6, "OctoHook"),
  a.set(7, "Blowish"),
  s.set(1, "Knowizall"),
  s.set(2, "Veneno"),
  s.set(3, "Wipe Genie"),
  s.set(4, "Apollyon"),
  s.set(5, "Frankender"),
  s.set(6, "Fio"),
  s.set(7, "Hocori"),
  _.set(1, "Willy Wheel"),
  _.set(2, "Drilla "),
  _.set(3, "Monica"),
  _.set(4, "Zeta"),
  _.set(5, "Sami"),
  _.set(6, "Gampo"),
  _.set(7, "Carry"),
  _.set(1, "Pozilla"),
  _.set(2, "Poceratop"),
  _.set(3, "Dinoxic"),
  _.set(4, "Pobarrian"),
  _.set(5, "Calepis "),
  _.set(6, "Teelop"),
  _.set(7, "Wyvo"),
  c.set(1, "Sig Sar"),
  c.set(2, "Brotopo"),
  c.set(3, "Pizzalien"),
  c.set(4, "Gree"),
  c.set(5, "Tototaco"),
  c.set(6, "Rupa"),
  c.set(7, "Trippy"),
  o.set(1, "Mysteria 1"),
  o.set(2, "Mysteria 2"),
  o.set(3, "Mysteria 3"),
  o.set(4, "Mysteria 4"),
  o.set(5, "Mysteria 5"),
  o.set(6, "Mysteria 6"),
  o.set(7, "Mysteria 7");

const l = new Map();
l.set(1, {
  name: "Terra",
  typeNames: t,
});
l.set(2, {
  name: "Aqua",
  typeNames: a,
});
l.set(3, {
  name: "Magica",
  typeNames: s,
});
l.set(4, {
  name: "Mecha",
  typeNames: n,
});
l.set(5, {
  name: "Ancia",
  typeNames: _,
});
l.set(6, {
  name: "Stella",
  typeNames: c,
});
l.set(7, {
  name: "Mysteria",
  typeNames: o,
});
function getClassName(e) {
  return l.has(e) ? l.get(e).name : null;
}
function getTypeName(r, t) {
  if (l.has(r)) {
    let e = l.get(r).typeNames;
    if (e.has(t)) return e.get(t);
  }
  return null;
}
