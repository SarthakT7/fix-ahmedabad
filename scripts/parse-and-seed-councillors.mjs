#!/usr/bin/env node
/**
 * Parses /tmp/councillors_new.txt and upserts all 192 AMC councillors +
 * correct ward names into Supabase.
 *
 * Prerequisite: migration-consolidate-reps.sql must already be applied.
 * Usage: node scripts/parse-and-seed-councillors.mjs
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Env ──────────────────────────────────────────────────────────────────────
const envFile = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
const env = {};
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k) env[k.trim()] = v.join("=").trim();
});
// Use service role key for seeding (bypasses RLS). Never expose this in the browser.
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── Ward name corrections  ────────────────────────────────────────────────────
// Maps ward_number → { official_name, zone } as per the official 2025 PDF.
// These replace whatever name the GeoJSON happened to use.
const WARD_CORRECTIONS = {
  1:  { name: "GOTA",                   zone: "North West" },
  2:  { name: "CHANDLODIA",             zone: "North West" },
  3:  { name: "CHANDKHEDA",             zone: "West"       },
  4:  { name: "SABARMATI",              zone: "West"       },
  5:  { name: "RANIP",                  zone: "West"       },
  6:  { name: "NAVA VADAJ",             zone: "West"       },
  7:  { name: "GHATLODIYA",             zone: "North West" },
  8:  { name: "THALTEJ",                zone: "North West" },
  9:  { name: "NARANPURA",              zone: "West"       },
  10: { name: "SARDAR PATEL STADIUM",   zone: "West"       },
  11: { name: "SARDARNAGAR",            zone: "North"      },
  12: { name: "NARODA",                 zone: "North"      },
  13: { name: "SAIJPURBOGHA",           zone: "North"      },
  14: { name: "KUBERNAGAR",             zone: "North"      },
  15: { name: "ASARWA",                 zone: "Central"    },
  16: { name: "SHAHIBAUG",              zone: "Central"    },
  17: { name: "SHAHPUR",                zone: "Central"    },
  18: { name: "NAVRANGPURA",            zone: "West"       },
  19: { name: "BODAKDEV",               zone: "North West" },
  20: { name: "JODHPUR",                zone: "South West" },
  21: { name: "DARIYAPUR",              zone: "Central"    },
  22: { name: "INDIA COLONY",           zone: "North"      },
  23: { name: "THAKKARBAPANAGAR",       zone: "North"      },
  24: { name: "NIKOL",                  zone: "East"       },
  25: { name: "VIRATNAGAR",             zone: "East"       },
  26: { name: "BAPUNAGAR",              zone: "North"      },
  27: { name: "SARASPUR",               zone: "North"      },
  28: { name: "KHADIA",                 zone: "Central"    },
  29: { name: "JAMALPUR",               zone: "Central"    },
  30: { name: "RAIKHAD",                zone: "Central"    },
  31: { name: "VASNA",                  zone: "West"       },
  32: { name: "VEJALPUR",               zone: "South West" },
  33: { name: "SARKHEJ",                zone: "South West" },
  34: { name: "MAKTAMPURA",             zone: "South West" },
  35: { name: "BAHERAMPURA",            zone: "South"      },
  36: { name: "DANILIMDA",              zone: "South"      },
  37: { name: "MANINAGAR",              zone: "South"      },
  38: { name: "GOMTIPUR",               zone: "East"       },
  39: { name: "AMRAIWADI",              zone: "East"       },
  40: { name: "ODHAV",                  zone: "East"       },
  41: { name: "VASTRAL",                zone: "East"       },
  42: { name: "INDRAPURI",              zone: "South"      },
  43: { name: "BHAIPURA HATKESHWAR",    zone: "East"       },
  44: { name: "KHOKHRA",                zone: "South"      },
  45: { name: "ISANPUR",                zone: "South"      },
  46: { name: "LAMBHA",                 zone: "South"      },
  47: { name: "RAMOL HATHIJAN",         zone: "East"       },
  48: { name: "VATVA",                  zone: "South"      },
};

// ── Councillor data (sourced from COUNCILOR_MASTER_DATA_23-06-2025 PDF) ──────
// Format: { cou_no, ward_no, name, party, gender, phone, email }
// party: "BJP" | "INC" | "AIMIM" | "IND" | null
// Seat 135 fell vacant (Maktampura) – omitted.
const COUNCILLORS = [
  // Ward 1 – GOTA
  { cou_no:1,  ward_no:1,  name:"Aratiben Kamleshbhai Chavda",          party:"BJP",   gender:"F", phone:"7990933048, 8160119917",       email:"artic6675@gmail.com" },
  { cou_no:2,  ward_no:1,  name:"Parulben Arvindbhai Patel",             party:"BJP",   gender:"F", phone:"7819870501",                   email:"parulpatel10069@gmail.com" },
  { cou_no:3,  ward_no:1,  name:"Ketankumar Babulal Patel",              party:"BJP",   gender:"M", phone:"9924136339",                   email:"ambaji1610@gmail.com" },
  { cou_no:4,  ward_no:1,  name:"Ajay Shambhubhai Desai",                party:"BJP",   gender:"M", phone:"9825020193",                   email:"ajaydesai763@gmail.com" },
  // Ward 2 – CHANDLODIA
  { cou_no:5,  ward_no:2,  name:"Rajeshriben Bhaveshbhai Patel",         party:"BJP",   gender:"F", phone:"7567734802, 9687250254, 8487832057", email:"rajashripatel24@gmail.com" },
  { cou_no:6,  ward_no:2,  name:"Rajeshwariben Rameshkumar Panchal",     party:"BJP",   gender:"F", phone:"7819870503, 9327909986",       email:"rajeshwaripanchal9172@gmail.com" },
  { cou_no:7,  ward_no:2,  name:"Hirabhai Valabhai Parmar",              party:"BJP",   gender:"M", phone:"9106598270, 9913424915",       email:"hirabhaiparmar4881@gmail.com" },
  { cou_no:8,  ward_no:2,  name:"Bharatbhai Keshavlal Patel",            party:"BJP",   gender:"M", phone:"7819870505",                   email:"bharatpatelbjp26@gmail.com" },
  // Ward 3 – CHANDKHEDA
  { cou_no:9,  ward_no:3,  name:"Ritaben Rajendrabhai Patel",            party:"BJP",   gender:"F", phone:"8156047857, 9824363766",       email:"ritapatel6083@gmail.com" },
  { cou_no:10, ward_no:3,  name:"Rajshri Vijaykumar Kesari",             party:"INC",   gender:"F", phone:"079-27571040, 7567300538",     email:"rajshri2030@icloud.com" },
  { cou_no:11, ward_no:3,  name:"Rakeshkumar Arvindlal Brahmbhatt",      party:"BJP",   gender:"M", phone:"9898142523",                   email:"brahmbhattrakesh2@gmail.com" },
  { cou_no:12, ward_no:3,  name:"Arunsingh Ramnayansingh Rajput",        party:"BJP",   gender:"M", phone:"9328784511",                   email:"arunsinghrajput69@gmail.com" },
  // Ward 4 – SABARMATI
  { cou_no:13, ward_no:4,  name:"Anjuben Alpesh Shah",                   party:"BJP",   gender:"F", phone:"079-27500176, 9428899966",     email:"shahanju95@gmail.com" },
  { cou_no:14, ward_no:4,  name:"Hiral Bharatbhai Bhavsar",              party:"BJP",   gender:"F", phone:"9099952677",                   email:"hiralbhavsar6177@gmail.com" },
  { cou_no:15, ward_no:4,  name:"Rana Rameshbhai Gomaji",                party:"BJP",   gender:"M", phone:"9898555168",                   email:"baburana93719@gmail.com" },
  { cou_no:16, ward_no:4,  name:"Chetanbhai Chinubhai Patel",            party:"BJP",   gender:"M", phone:"9173990000",                   email:"16ccpatel@ahmedabadcity.gov.in" },
  // Ward 5 – RANIP
  { cou_no:17, ward_no:5,  name:"Bhaviben Pathikbhai Panchal",           party:"BJP",   gender:"F", phone:"9137420021",                   email:"bhavipathikpanchal@gmail.com" },
  { cou_no:18, ward_no:5,  name:"Geetaben Kamleshkumar Patel",           party:"BJP",   gender:"F", phone:"7819870511",                   email:"geetakpatel30@gmail.com" },
  { cou_no:19, ward_no:5,  name:"Dasharathbhai Harjivandas Patel",       party:"BJP",   gender:"M", phone:"9328784509, 9426833033",       email:"dasharathpatel.1965@gmail.com" },
  { cou_no:20, ward_no:5,  name:"Viral Bharatkumar Vyas",                party:"BJP",   gender:"M", phone:"9998901110, 8733933122",       email:"viralvyas290988@gmail.com" },
  // Ward 6 – NAVA VADAJ
  { cou_no:21, ward_no:6,  name:"Lalita Hamirbhai Makwana",              party:"BJP",   gender:"F", phone:"6352909096, 7874107027, 8487917548", email:"lalitamakwana5@gmail.com" },
  { cou_no:22, ward_no:6,  name:"Bhavnaben Hasmukhbhai Vaghela",         party:"BJP",   gender:"F", phone:"9426076440, 7819870514, 9429410022", email:null },
  { cou_no:23, ward_no:6,  name:"Yogeshkumar Kantilal Patel",            party:"BJP",   gender:"M", phone:"9427328428",                   email:"ykpatel1963@yahoo.com" },
  { cou_no:24, ward_no:6,  name:"Vijay Khemchandbhai Panchal",           party:"BJP",   gender:"M", phone:"9909026734",                   email:"vijaypanchalv4444@gmail.com" },
  // Ward 7 – GHATLODIYA
  { cou_no:25, ward_no:7,  name:"Bhavnaben Pramukhbhai Patel",           party:"BJP",   gender:"F", phone:"7819870518, 9327490339",       email:"26bhavnapatela@gmail.com" },
  { cou_no:26, ward_no:7,  name:"Minaxiben Hasmukhbhai Nayak",           party:"BJP",   gender:"F", phone:"9737672847, 9879494679",       email:"n.minaxi1967@gmail.com" },
  { cou_no:27, ward_no:7,  name:"Jatinkumar Zaverbhai Patel",            party:"BJP",   gender:"M", phone:"9328784520",                   email:"jatinpatelamc@gmail.com" },
  { cou_no:28, ward_no:7,  name:"Pravinbhai Ambalal Patel",              party:"BJP",   gender:"M", phone:"9825410100",                   email:"mahadeviya100@gmail.com" },
  // Ward 8 – THALTEJ
  { cou_no:29, ward_no:8,  name:"Niruben Dineshbhai Dabhi",              party:"BJP",   gender:"F", phone:"7016890580",                   email:"nirubendineshbhaidabhi@gmail.com" },
  { cou_no:30, ward_no:8,  name:"Rushina Mahendrabhai Patel",            party:"BJP",   gender:"F", phone:"079-48408188, 9662896532",     email:"rushinapatel14@gmail.com" },
  { cou_no:31, ward_no:8,  name:"Samir Shambhubhai Patel",               party:"BJP",   gender:"M", phone:"9904929057, 9824301380",       email:"samirpatel.bjp@gmail.com" },
  { cou_no:32, ward_no:8,  name:"Hiteshbhai Kantilal Barot",             party:"BJP",   gender:"M", phone:"9824010022",                   email:"kuldeepbarot8060@gmail.com" },
  // Ward 9 – NARANPURA
  { cou_no:33, ward_no:9,  name:"Brinda Nayanbhai Surati",               party:"BJP",   gender:"F", phone:"8238733763",                   email:"brindanayansurti@gmail.com" },
  { cou_no:34, ward_no:9,  name:"Gitaben Jibhaidas Patel",               party:"BJP",   gender:"F", phone:"9328784564",                   email:"gita.patel99997@yahoo.com" },
  { cou_no:35, ward_no:9,  name:"Jayeshbhai Parmanandbhai Patel",        party:"BJP",   gender:"M", phone:"9328784527",                   email:"jayeshpatel873@gmail.com" },
  { cou_no:36, ward_no:9,  name:"Darshan Jashvantlal Shah",              party:"BJP",   gender:"M", phone:"9825846582",                   email:"darshanshah71@yahoo.com" },
  // Ward 10 – SARDAR PATEL STADIUM
  { cou_no:37, ward_no:10, name:"Dipalben Hardikbhai Patel",             party:"BJP",   gender:"F", phone:"9327094834, 9904542635",       email:"dipalhpatel7777@gmail.com" },
  { cou_no:38, ward_no:10, name:"Rashmiben Arjukumar Bhatt",             party:"BJP",   gender:"F", phone:"6351840119, 9898229239",       email:"arjubhatt3999@gmail.com" },
  { cou_no:39, ward_no:10, name:"Mukeshkumar Dineshbhai Mistry",         party:"BJP",   gender:"M", phone:"7819870525, 9601477999",       email:"mukeshbond007@gmail.com" },
  { cou_no:40, ward_no:10, name:"Pradipbhai Deviprasad Dave",            party:"BJP",   gender:"M", phone:"7819870524, 9825586611",       email:"p.dave727@gmail.com" },
  // Ward 11 – SARDARNAGAR
  { cou_no:41, ward_no:11, name:"Mittalbahen Nileshbhai Makwana",        party:"BJP",   gender:"F", phone:"7600119391",                   email:"mnilesh55@gmail.com" },
  { cou_no:42, ward_no:11, name:"Kanchanben Sureshkumar Panjwani",       party:"BJP",   gender:"F", phone:"9328784534, 9924489323",       email:"kanchanpanjwani74@gmail.com" },
  { cou_no:43, ward_no:11, name:"Sureshbhai Bhagvanbhai Danani",         party:"BJP",   gender:"M", phone:"9426533643, 7069834683",       email:"suresh671111@gmail.com" },
  { cou_no:44, ward_no:11, name:"Chandraprakash Murli Khanchandani",     party:"BJP",   gender:"M", phone:"9377626362, 9510607548",       email:"sunny.khanchandani1234@gmail.com" },
  // Ward 12 – NARODA
  { cou_no:45, ward_no:12, name:"Alkaben Pradyumanbhai Mistry",          party:"BJP",   gender:"F", phone:"7819870528, 9377763599",       email:"apmistry15@gmail.com" },
  { cou_no:46, ward_no:12, name:"Vaishaliben Yatinkumar Joshi",          party:"BJP",   gender:"F", phone:"9974839246",                   email:"wish21384@yahoo.com" },
  { cou_no:47, ward_no:12, name:"Rajendra Jayantibhai Solanki",          party:"BJP",   gender:"M", phone:"9737554018",                   email:"solankirajendra42@gmail.com" },
  { cou_no:48, ward_no:12, name:"Vipul Chinubhai Patel",                 party:"BJP",   gender:"M", phone:"9825770777",                   email:"somabhaipatel13@gmail.com" },
  // Ward 13 – SAIJPURBOGHA
  { cou_no:49, ward_no:13, name:"Reshma Manojkumar Kukrani",             party:"BJP",   gender:"F", phone:"9898806469, 9925596696",       email:"reshmakukrani2626@gmail.com" },
  { cou_no:50, ward_no:13, name:"Vinodkumari Sureshkumar Chaudhari",     party:"BJP",   gender:"F", phone:"8780133929, 9925021860",       email:"sc24307@gmail.com" },
  { cou_no:51, ward_no:13, name:"Mahadevbhai Vashrambhai Desai",         party:"BJP",   gender:"M", phone:"9825303199, 9327426068",       email:"mhdvdesai@gmail.com" },
  { cou_no:52, ward_no:13, name:"Hasmukhbhai Laljibhai Patel",           party:"BJP",   gender:"M", phone:"9327030910",                   email:"hlpatel748@gmail.com" },
  // Ward 14 – KUBERNAGAR
  { cou_no:53, ward_no:14, name:"Urmilaben Jethabhai Parmar",            party:"INC",   gender:"F", phone:"9726609368, 8347072016",       email:"parmarjethabhai565@gmail.com" },
  { cou_no:54, ward_no:14, name:"Kaminidevi Vinodkumar Za",              party:"INC",   gender:"F", phone:"9327483413, 7023193407",       email:"jha459538@gmail.com" },
  { cou_no:55, ward_no:14, name:"Geetaben Vishalsinh Chavda",            party:"BJP",   gender:"F", phone:"7622909540",                   email:"gitachavda1994@gmail.com" },
  { cou_no:56, ward_no:14, name:"Nikulsingh Kamalsingh Tomar",           party:"INC",   gender:"M", phone:"079-29722227, 9998222222",     email:"nikulsinghtomar2021ncp@gmail.com" },
  // Ward 15 – ASARWA
  { cou_no:57, ward_no:15, name:"Ansuyaben Ravjibhai Patel",             party:"BJP",   gender:"F", phone:"079-22684631, 9427523615",     email:"patelanu4631@yahoo.co.in" },
  { cou_no:58, ward_no:15, name:"Menaben Bhikhubhai Patni",              party:"BJP",   gender:"F", phone:"9316670135, 9408784866",       email:"menabenpatni@gmail.com" },
  { cou_no:59, ward_no:15, name:"Omprakash Naranji Prajapati",           party:"BJP",   gender:"M", phone:"9725995550, 9624440131",       email:"omjiprjapati03@gmail.com" },
  { cou_no:60, ward_no:15, name:"Dishant Laxmanbhai Thakor",             party:"BJP",   gender:"M", phone:"9510009993",                   email:"dishantsocialist@gmail.com" },
  // Ward 16 – SHAHIBAUG
  { cou_no:61, ward_no:16, name:"Jasminben Sudhanshu Bhavsar",           party:"BJP",   gender:"F", phone:"9408760087, 8780407413",       email:"jasminebhavsar774@gmail.com" },
  { cou_no:62, ward_no:16, name:"Pratibhaben Rakeshkumar Jain",          party:"BJP",   gender:"F", phone:"7567044559",                   email:"meeleeshah95@gmail.com" },
  { cou_no:63, ward_no:16, name:"Jasubhai Mohanji Chauhan",              party:"BJP",   gender:"M", phone:"9824473846, 9409619336",       email:"jashul1974ksk@gmail.com" },
  { cou_no:64, ward_no:16, name:"Bharatbhai Ranchhodbhai Patel",         party:"BJP",   gender:"M", phone:"9601454515, 9825039824",       email:"patelbharat3096@gmail.com" },
  // Ward 17 – SHAHPUR
  { cou_no:65, ward_no:17, name:"Arti Girish Panchal",                   party:"BJP",   gender:"F", phone:"8160562041",                   email:"arti.panchal@yahoo.com" },
  { cou_no:66, ward_no:17, name:"Rekhaben Badhaji Chauhan",              party:"BJP",   gender:"F", phone:"9723244220",                   email:"rekhachauhan236@gmail.com" },
  { cou_no:67, ward_no:17, name:"Pratapbhai Keshavbhai Agja",            party:"BJP",   gender:"M", phone:"9824473845",                   email:"pratap.agja.25@gmail.com" },
  { cou_no:68, ward_no:17, name:"Akbarbhai Husainbhai Bhatti",           party:"INC",   gender:"M", phone:"9227622755, 9825022755",       email:"aku_bhatti143@yahoo.com" },
  // Ward 18 – NAVRANGPURA
  { cou_no:69, ward_no:18, name:"Ashaben Hiteshkumar Brahmabhatt",       party:"BJP",   gender:"F", phone:"079-26468133, 8905995831",     email:"ashahiteshb@gmail.com" },
  { cou_no:70, ward_no:18, name:"Vandana Rajivbhai Shah",                party:"BJP",   gender:"F", phone:"9429525331, 7819870541",       email:"70vrshah@gmail.com" },
  { cou_no:71, ward_no:18, name:"Hemant Tulsibhai Parmar",               party:"BJP",   gender:"M", phone:"9898863788",                   email:"hemantparmar14683@gmail.com" },
  { cou_no:72, ward_no:18, name:"Nirav Jagdishbhai Kavi",                party:"BJP",   gender:"M", phone:"9898414842",                   email:"niravkavi111@gmail.com" },
  // Ward 19 – BODAKDEV
  { cou_no:73, ward_no:19, name:"Diptiben Jitendrabhai Amarkotia",       party:"BJP",   gender:"F", phone:"9898717157",                   email:"diptikotiya@gmail.com" },
  { cou_no:74, ward_no:19, name:"Vasantiben Narendra Patel",             party:"BJP",   gender:"F", phone:"9427630777",                   email:"vasantipatel12968@gmail.com" },
  { cou_no:75, ward_no:19, name:"Kantibhai Arjanbhai Patel",             party:"BJP",   gender:"M", phone:"9328784568, 9879567273",       email:"patelkantikaka3388@gmail.com" },
  { cou_no:76, ward_no:19, name:"Devang Jitendrabhai Dani",              party:"BJP",   gender:"M", phone:"9426302521",                   email:"djdani8182@gmail.com" },
  // Ward 20 – JODHPUR
  { cou_no:77, ward_no:20, name:"Bhartiben Hitendrasinh Gohil",          party:"BJP",   gender:"F", phone:"9904821200, 9825876077",       email:"bhartiben9936@gmail.com" },
  { cou_no:78, ward_no:20, name:"Pravinaben Bhailalbhai Patel",          party:"BJP",   gender:"F", phone:"8780104125, 9737296767",       email:null },
  { cou_no:79, ward_no:20, name:"Arvindbhai Naranbhai Parmar",           party:"BJP",   gender:"M", phone:"8866203039",                   email:"arvind.parmar410.ap@gmail.com" },
  { cou_no:80, ward_no:20, name:"Ashish Amrutlal Patel",                 party:"BJP",   gender:"M", phone:"079-26762888, 9879555963",     email:"ashishapatel74@gmail.com" },
  // Ward 21 – DARIYAPUR
  { cou_no:81, ward_no:21, name:"Madhuri Dhruv Kalapi",                  party:"INC",   gender:"F", phone:"9586798165, 8320672731",       email:"madhurikalapi@gmail.com" },
  { cou_no:82, ward_no:21, name:"Samira Mohmedyusuf Shaikh",             party:"INC",   gender:"F", phone:"9377035521",                   email:"shaikhyusuf435@gmail.com" },
  { cou_no:83, ward_no:21, name:"Imtiyazhusain Gulamhusain Shaikh",      party:"INC",   gender:"M", phone:"9825398036",                   email:"imtiyazpramukh@gmail.com" },
  { cou_no:84, ward_no:21, name:"Nirav Surendrakumar Baxi",              party:"INC",   gender:"M", phone:"079-27454755, 9824414444",     email:"nirav992007@yahoo.co.in" },
  // Ward 22 – INDIA COLONY
  { cou_no:85, ward_no:22, name:"Padmaben Sanjaykumar Brahmbhatt",       party:"INC",   gender:"F", phone:"9898753278, 7819870549",       email:null },
  { cou_no:86, ward_no:22, name:"Nituben Sachinkumar Parmar",            party:"BJP",   gender:"F", phone:"7874902304",                   email:"nituparmar9898@gmail.com" },
  { cou_no:87, ward_no:22, name:"Bharatbhai Bhurabhai Kakadiya",         party:"BJP",   gender:"M", phone:"9879058012",                   email:"bharatkakadiya.bk@gmail.com" },
  { cou_no:88, ward_no:22, name:"Bhavikkumar Kantilal Patel",            party:"BJP",   gender:"M", phone:"9099774400",                   email:"bhavikpatel1299@gmail.com" },
  // Ward 23 – THAKKARBAPANAGAR
  { cou_no:89, ward_no:23, name:"Harshaben Prakashkumar Gurjar",         party:"BJP",   gender:"F", phone:"9081295111, 9725004178",       email:"harshagurjar.bjp@gmail.com" },
  { cou_no:90, ward_no:23, name:"Kanchanben Vinubhai Radadiya",          party:"BJP",   gender:"F", phone:"9913723524",                   email:"kanchanbenradadiya26@gmail.com" },
  { cou_no:91, ward_no:23, name:"Kiritkumar Jivanlal Parmar",            party:"BJP",   gender:"M", phone:"9374230957",                   email:"kirit100parmar@gmail.com" },
  { cou_no:92, ward_no:23, name:"Dikshitkumar Ranchhodbhai Patel",       party:"BJP",   gender:"M", phone:"9624341877, 7819870553",       email:"dixitdrpatel1990@gmail.com" },
  // Ward 24 – NIKOL
  { cou_no:93, ward_no:24, name:"Ushaben Manibhai Rohit",                party:"BJP",   gender:"F", phone:"9662950194, 9724351587",       email:"rohitusha291@yahoo.com" },
  { cou_no:94, ward_no:24, name:"Vilasben Bharatbhai Desai",             party:"BJP",   gender:"F", phone:"9428043842, 7984177875",       email:"vilasdesai19@gmail.com" },
  { cou_no:95, ward_no:24, name:"Dipakbhai Ganpatbhai Panchal",          party:"BJP",   gender:"M", phone:"9409285870",                   email:"panchaldipakg@gmail.com" },
  { cou_no:96, ward_no:24, name:"Baldevbhai Kandas Patel",               party:"BJP",   gender:"M", phone:"7819870554",                   email:"bkpatel.bjp@gmail.com" },
  // Ward 25 – VIRATNAGAR
  { cou_no:97, ward_no:25, name:"Bakula Manish Engineer",                party:"BJP",   gender:"F", phone:"7777982224",                   email:"bakulaengineer@gmail.com" },
  { cou_no:98, ward_no:25, name:"Sangitaben Bharatbhai Korat",           party:"BJP",   gender:"F", phone:"9824088131, 9824571042",       email:"sangitabharatkorat@gmail.com" },
  { cou_no:99, ward_no:25, name:"Dr. Ranjitbhai Bhagubhai Vank",         party:"BJP",   gender:"M", phone:"9727263093, 9094757575",       email:"ranjitsinh.8200@gmail.com" },
  { cou_no:100,ward_no:25, name:"Mukeshbhai Ravjibhai Patel",            party:"BJP",   gender:"M", phone:"9825060383",                   email:"mukesh.patel9601@gmail.com" },
  // Ward 26 – BAPUNAGAR
  { cou_no:101,ward_no:26, name:"Sarojben Shankarlal Solanki",           party:"BJP",   gender:"F", phone:"9909830231, 9586833944",       email:"saroj.s.solanki28@gmail.com" },
  { cou_no:102,ward_no:26, name:"Jayshriben Dattatri Dasari",            party:"BJP",   gender:"F", phone:"9925520025, 9662110222",       email:"jayshridasri@gmail.com" },
  { cou_no:103,ward_no:26, name:"Ashwin Babubhai Pethani",               party:"BJP",   gender:"M", phone:"9328784608",                   email:"pethani1970@gmail.com" },
  { cou_no:104,ward_no:26, name:"Prakash Dharamsinh Gurjar",             party:"BJP",   gender:"M", phone:"9825015804",                   email:"prakashgurjar_office@yahoo.com" },
  // Ward 27 – SARASPUR
  { cou_no:105,ward_no:27, name:"Bhartiben Mukeshbhai Vaniya",           party:"BJP",   gender:"F", phone:"9427401045",                   email:"vb94274@gmail.com" },
  { cou_no:106,ward_no:27, name:"Manjulaben Ramuji Thakor",              party:"BJP",   gender:"F", phone:"8128285673",                   email:"manjulathakor103@gmail.com" },
  { cou_no:107,ward_no:27, name:"Dineshsinh Rajendrasinh Kushwah",       party:"BJP",   gender:"M", phone:"9374001900",                   email:"kushwahdineshsingh@gmail.com" },
  { cou_no:108,ward_no:27, name:"Bhaskar Manilal Bhatt",                 party:"BJP",   gender:"M", phone:"9327426063",                   email:"bhaskarbhatt56@gmail.com" },
  // Ward 28 – KHADIA
  { cou_no:109,ward_no:28, name:"Nikiben Shwetangkumar Modi",            party:"BJP",   gender:"F", phone:"079-22123534, 9328784633",     email:"nikimodi4@gmail.com" },
  { cou_no:110,ward_no:28, name:"Geetaben Navnitlal Parmar",             party:"BJP",   gender:"F", phone:"9898456760",                   email:"gita.mochi@gmail.com" },
  { cou_no:111,ward_no:28, name:"Umang Bharatbhai Nayak",                party:"BJP",   gender:"M", phone:"9824997249",                   email:"umangnayakpepsi@gmail.com" },
  { cou_no:112,ward_no:28, name:"Milind Arvindkumar Raval",              party:"BJP",   gender:"M", phone:null,                           email:null },
  // Ward 29 – JAMALPUR
  { cou_no:113,ward_no:29, name:"Mustaq Faridbhai Khadiwala",            party:"AIMIM", gender:"M", phone:"9328784632",                   email:"khadiwalamustaq@gmail.com" },
  { cou_no:114,ward_no:29, name:"Mohammadrafiq Gulam Mustufa Shaikh",    party:"AIMIM", gender:"M", phone:"9727426015, 9327426015",       email:"mohammadrafikshaikh61@gmail.com" },
  { cou_no:115,ward_no:29, name:"Afsanabanu Nasiruddin Chisty",          party:"AIMIM", gender:"F", phone:"9327533088, 9328394204",       email:"afsanabanuchisty@gmail.com" },
  { cou_no:116,ward_no:29, name:"Binaben Rahulkumar Parmar",             party:"AIMIM", gender:"F", phone:"9737752044",                   email:"rahulparmar12581@gmail.com" },
  // Ward 30 – RAIKHAD / PALDI (Central Zone)
  { cou_no:117,ward_no:30, name:"Pankaj Bhachubhai Bhatt",               party:"BJP",   gender:"M", phone:"9428018100",                   email:"pankajbhatt1010@gmail.com" },
  { cou_no:118,ward_no:30, name:"Chetnaben Pareshkumar Patel",           party:"BJP",   gender:"F", phone:"9662886666",                   email:null },
  { cou_no:119,ward_no:30, name:"Jainik Nautambhai Vakil",               party:"BJP",   gender:"M", phone:"9825159617",                   email:"jainikca@hotmail.com" },
  { cou_no:120,ward_no:30, name:"Pooja Darshbhai Dave",                  party:"BJP",   gender:"F", phone:"9979883892",                   email:"poojaddave@gmail.com" },
  // Ward 31 – VASNA
  { cou_no:121,ward_no:31, name:"Sonalben Jankhilbhai Thakor",           party:"BJP",   gender:"F", phone:"8153056903, 7698580961",       email:"sonalbenthakor20790@gmail.com" },
  { cou_no:122,ward_no:31, name:"Snehakumari Vijayrajsinh Parmar",       party:"BJP",   gender:"F", phone:"9662021555, 7819870574",       email:"parmar.sneha101555@gmail.com" },
  { cou_no:123,ward_no:31, name:"Himanshu Kishorchandra Wala",           party:"BJP",   gender:"M", phone:"7567887967",                   email:"hkwala@gmail.com" },
  { cou_no:124,ward_no:31, name:"Mehul Chinubhai Shah",                  party:"BJP",   gender:"M", phone:"9825406447, 7935642398",       email:"mehul27566@gmail.com" },
  // Ward 32 – VEJALPUR
  { cou_no:125,ward_no:32, name:"Pritish Vinodchandra Mehta",            party:"BJP",   gender:"M", phone:"9427419566, 9023983345",       email:"pritishadc@yahoo.com" },
  { cou_no:126,ward_no:32, name:"Kalpanaben Hiralal Chavda",             party:"BJP",   gender:"F", phone:"8758193335",                   email:"kalpanaben1973@gmail.com" },
  { cou_no:127,ward_no:32, name:"Dilipbhai Dahyabhai Bagaria",           party:"BJP",   gender:"M", phone:"9328784626, 9925033975",       email:"dilipdbagaria@gmail.com" },
  { cou_no:128,ward_no:32, name:"Parulben Tejasbhai Dave",               party:"BJP",   gender:"F", phone:"9638516111, 9586668581",       email:"paruldavet@gmail.com" },
  // Ward 33 – SARKHEJ
  { cou_no:129,ward_no:33, name:"Alka Jagdishbhai Shah",                 party:"BJP",   gender:"F", phone:"9898581588",                   email:"alkajshah1964@gmail.com" },
  { cou_no:130,ward_no:33, name:"Jayaben Laxmanbhai Desai",              party:"BJP",   gender:"F", phone:"9824966320",                   email:"jayabendesai16@gmail.com" },
  { cou_no:131,ward_no:33, name:"Jayesh Mahendrabhai Trivedi",           party:"BJP",   gender:"M", phone:"9898690817",                   email:"contact@jayeshtrivedi.in" },
  { cou_no:132,ward_no:33, name:"Surendrabhai Bhanbhai Khachar",         party:"BJP",   gender:"M", phone:"9824067320",                   email:"khacharsurendra11@gmail.com" },
  // Ward 34 – MAKTAMPURA (one seat vacant)
  { cou_no:133,ward_no:34, name:"Suhana Ahemadbhai Mansuri",             party:"AIMIM", gender:"F", phone:"9727852885",                   email:"suhanamansuri1429@gmail.com" },
  { cou_no:134,ward_no:34, name:"Jenalbibi Hulam Moyuddin Shaikh",       party:"AIMIM", gender:"F", phone:"8780970100",                   email:"zainabshaikh1953@gmail.com" },
  { cou_no:136,ward_no:34, name:"Hazi Asrarbaig Saqurbaig Mirza",        party:"INC",   gender:"M", phone:"9328784572, 9824466114",       email:"hajiasrar@gmail.com" },
  // Ward 35 – BAHERAMPURA
  { cou_no:137,ward_no:35, name:"Kamlaben Kantibhai Chavda",             party:"INC",   gender:"F", phone:"9328784628",                   email:"coucillorkkchavda@gmail.com" },
  { cou_no:138,ward_no:35, name:"Shahjahabanu Sarfaraj Ansari",          party:"INC",   gender:"F", phone:"9974740314, 7016550530",       email:"shajhanansari9974@gmail.com" },
  { cou_no:139,ward_no:35, name:"Tasnimalam Bawasaheb Tirmizi",          party:"INC",   gender:"M", phone:"9998279999",                   email:"tjtirmizi@gmail.com" },
  { cou_no:140,ward_no:35, name:"Rafikbhai Vajirbhai Shaikh",            party:"INC",   gender:"M", phone:"9327005649",                   email:"shethjirafik@gmail.com" },
  // Ward 36 – DANILIMDA
  { cou_no:141,ward_no:36, name:"Jamanaben Sureshbhai Vegda",            party:"INC",   gender:"F", phone:"9428047990",                   email:"jamnavegda@gmail.com" },
  { cou_no:142,ward_no:36, name:"Ramilaben Sureshbhai Parmar",           party:"INC",   gender:"F", phone:"7819870583, 9383536657",       email:"ramilabenparmar1965@gmail.com" },
  { cou_no:143,ward_no:36, name:"Shehzadkhan Nasirkhan Pathan",          party:"INC",   gender:"M", phone:"9537990758",                   email:"shehzadkpathaniyc@gmail.com" },
  { cou_no:144,ward_no:36, name:"Mohammad Salim Abdulrazak Sabuvala",    party:"INC",   gender:"M", phone:"8401003842, 9898036790",       email:"faizmemon3639@gmail.com" },
  // Ward 37 – MANINAGAR
  { cou_no:145,ward_no:37, name:"Ilaxi Samirbhai Shah",                  party:"BJP",   gender:"F", phone:"6359976678",                   email:"ilaxi.samir@gmail.com" },
  { cou_no:146,ward_no:37, name:"Shital Anandkumar Daga",                party:"BJP",   gender:"F", phone:"9328784637, 9586859090",       email:"shital.daga8775@gmail.com" },
  { cou_no:147,ward_no:37, name:"Chandrkant Hargovind Chauhan",          party:"BJP",   gender:"M", phone:"9825628862",                   email:"munsi2110@yahoo.com" },
  { cou_no:148,ward_no:37, name:"Karan Rameshbhai Bhatt",                party:"BJP",   gender:"M", phone:"9909000939",                   email:"bhattkaran83@gmail.com" },
  // Ward 38 – GOMTIPUR
  { cou_no:149,ward_no:38, name:"Kamlaben Kuberbhai Chauhan",            party:"INC",   gender:"F", phone:"9427523308, 8320471467",       email:"kamlabenchauhan25@gmail.com" },
  { cou_no:150,ward_no:38, name:"Rukshanabanu Harunbhai Ghanchi",        party:"INC",   gender:"F", phone:"7819870592",                   email:"imranghanchi67@gmail.com" },
  { cou_no:151,ward_no:38, name:"Mohamad Iqbal Shaikh",                  party:"INC",   gender:"M", phone:"9227426090",                   email:"iqbalshaikh.7466@gmail.com" },
  { cou_no:152,ward_no:38, name:"Kasambhai Shaikh",                      party:"INC",   gender:"M", phone:null,                           email:null },
  // Ward 39 – AMRAIWADI
  { cou_no:153,ward_no:39, name:"Jashiben Babubhai Parmar",              party:"BJP",   gender:"F", phone:"9409277255",                   email:"jashibenparmar295@gmail.com" },
  { cou_no:154,ward_no:39, name:"Pratibha Mahendrabhai Dubey",           party:"BJP",   gender:"F", phone:"7600468039",                   email:"dubepratibha8394@gmail.com" },
  { cou_no:155,ward_no:39, name:"Omprakash Muktaji Bagdi",               party:"BJP",   gender:"M", phone:"9824024721",                   email:"ombagdi07@gmail.com" },
  { cou_no:156,ward_no:39, name:"Jagdishbhai Khimhibhai Rathod",         party:"INC",   gender:"M", phone:"9624019585",                   email:"jagdishbhairathod627@gmail.com" },
  // Ward 40 – ODHAV
  { cou_no:157,ward_no:40, name:"Nitaben Visabhai Desai",                party:"BJP",   gender:"F", phone:"9016246722, 8347173312",       email:"nitabendesai94@gmail.com" },
  { cou_no:158,ward_no:40, name:"Minu Raghavendrasinh Thakur",           party:"BJP",   gender:"F", phone:"9067220040, 9712147916",       email:"minuthakur396@gmail.com" },
  { cou_no:159,ward_no:40, name:"Dilipbhai Parshottambhai Patel",        party:"BJP",   gender:"M", phone:"9825290753, 8980290753",       email:"bilippcpatel@gmail.com" },
  { cou_no:160,ward_no:40, name:"Ghanshyambhai Dave (Rajubhai)",         party:"BJP",   gender:"M", phone:"9426506090, 9825275050",       email:"rajesh92424@gmail.com" },
  // Ward 41 – VASTRAL
  { cou_no:161,ward_no:41, name:"Gitaben Vishnubhai Prajapati",          party:"BJP",   gender:"F", phone:"9898380226",                   email:"geetabenprajapati555@gmail.com" },
  { cou_no:162,ward_no:41, name:"Chandrikaben Mahadevbhai Patel",        party:"BJP",   gender:"F", phone:"9879012511, 9724167808",       email:"bipin.engineering94@gmail.com" },
  { cou_no:163,ward_no:41, name:"Aniruddhsinh Jasvantsinh Zala",         party:"BJP",   gender:"M", phone:"9898045262",                   email:"ajzala2971@gmail.com" },
  { cou_no:164,ward_no:41, name:"Pareshbhai Hargovindbhai Patel",        party:"BJP",   gender:"M", phone:"9925022185, 9879094890",       email:"jayvirtrading@gmail.com" },
  // Ward 42 – INDRAPURI
  { cou_no:165,ward_no:42, name:"Alkaben Prashantbhai Padharia",         party:"BJP",   gender:"F", phone:"9924027275, 9727787477",       email:"sachi_international@yahoo.com" },
  { cou_no:166,ward_no:42, name:"Vacant (Shilpaben Hasmukhbhai Patel)",  party:null,    gender:null,phone:null,                           email:null },
  { cou_no:167,ward_no:42, name:"Kaushikbhai Natwarlal Patel",           party:"BJP",   gender:"M", phone:"9426067565, 9978541949",       email:"kavyshikp@gmail.com" },
  { cou_no:168,ward_no:42, name:"Chandrakantbhai Ravjibhai Prajapati",   party:"BJP",   gender:"M", phone:"9825702576",                   email:"bhaichandrakant27@gmail.com" },
  // Ward 43 – BHAIPURA HATKESHWAR
  { cou_no:169,ward_no:43, name:"Vasantiben Mahendrabhai Patel",         party:"BJP",   gender:"F", phone:"9328784663, 9428355299",       email:"vasantiben2812@gmail.com" },
  { cou_no:170,ward_no:43, name:"Miraben Rajneeshkumar Rajput",          party:"BJP",   gender:"F", phone:"9374231921",                   email:"rajputmira241@gmail.com" },
  { cou_no:171,ward_no:43, name:"Gaurang Dhanjibhai Prajapati",          party:"BJP",   gender:"M", phone:"9825954460",                   email:"togaurangprajapati@gmail.com" },
  { cou_no:172,ward_no:43, name:"Kamleshbhai Rambhai Patel",             party:"BJP",   gender:"M", phone:"9825282133",                   email:"kamlesh19176@gmail.com" },
  // Ward 44 – KHOKHRA
  { cou_no:173,ward_no:44, name:"Jigishaben Sunilbhai Solanki",          party:"BJP",   gender:"F", phone:"9427029055",                   email:"jigisha.solanki1973@gmail.com" },
  { cou_no:174,ward_no:44, name:"Shivaniben Sunilbhai Janaikar",         party:"BJP",   gender:"F", phone:"9825617102, 7573075448",       email:"shivanijanaikar@gmail.com" },
  { cou_no:175,ward_no:44, name:"Chetankumar Maheshbhai Parmar",         party:"BJP",   gender:"M", phone:"8141099990",                   email:"chetanparmar8810@gmail.com" },
  { cou_no:176,ward_no:44, name:"Kamlesh Patel",                         party:"BJP",   gender:"M", phone:"9825017530",                   email:"kampatel8068@gmail.com" },
  // Ward 45 – ISANPUR
  { cou_no:177,ward_no:45, name:"Gitaben Jitendra Solanki",              party:"BJP",   gender:"F", phone:"8780520393, 6353435448",       email:"gitasolanki1011@gmail.com" },
  { cou_no:178,ward_no:45, name:"Jashodaben Amaliyar",                   party:"BJP",   gender:"F", phone:"9879783132",                   email:"jasoda.m.a3132@gmail.com" },
  { cou_no:179,ward_no:45, name:"Maulik Gautambhai Patel",               party:"BJP",   gender:"M", phone:"9825004700",                   email:"maulikp9899@gmail.com" },
  { cou_no:180,ward_no:45, name:"Shankarbhai Revabhai Chaudhari",        party:"BJP",   gender:"M", phone:"9327011735",                   email:"cshankar889@gmail.com" },
  // Ward 46 – LAMBHA
  { cou_no:181,ward_no:46, name:"Mounaben Dineshkumar Raval",            party:"BJP",   gender:"F", phone:"9879001036",                   email:"ravalmouna@yahoo.in" },
  { cou_no:182,ward_no:46, name:"Dr. Chandni Tejas Patel",               party:"BJP",   gender:"F", phone:"9016924435, 9510899105",       email:"tejasauto4435@gmail.com" },
  { cou_no:183,ward_no:46, name:"Mansinh Naransinh Solanki",             party:"BJP",   gender:"M", phone:"9067308084, 9054141477",       email:"mansinghsolanki1477@gmail.com" },
  { cou_no:184,ward_no:46, name:"Kalubhai Popatbhai Bharwad",            party:"IND",   gender:"M", phone:"9998752656, 9328784680",       email:null },
  // Ward 47 – RAMOL HATHIJAN
  { cou_no:185,ward_no:47, name:"Chandrikaben Hareshbhai Panchal",       party:"BJP",   gender:"F", phone:"7600055507, 9586668217",       email:"chandrikabenpanchal3@gmail.com" },
  { cou_no:186,ward_no:47, name:"Suneetaben Dineshbhai Chauhan",         party:"BJP",   gender:"F", phone:"9998158162, 9974738862",       email:"suneetachauhan399@gmail.com" },
  { cou_no:187,ward_no:47, name:"Sidhharth Mukeshbhai Parmar",           party:"BJP",   gender:"M", phone:"9913965400",                   email:"parmarsidhdharth2@gmail.com" },
  { cou_no:188,ward_no:47, name:"Maulikbhai Atulkumar Patel",            party:"BJP",   gender:"M", phone:"9328784692, 9824172209",       email:"maulikpatel2297@gmail.com" },
  // Ward 48 – VATVA
  { cou_no:189,ward_no:48, name:"Jalpaben Rupeshkumar Pandya",           party:"BJP",   gender:"F", phone:"9099503602, 7819870619",       email:"jalpapandya25@gmail.com" },
  { cou_no:190,ward_no:48, name:"Sarojben Bharatbhai Soni",              party:"BJP",   gender:"F", phone:"9824464811, 9662622771",       email:"sarojsoni01@gmail.com" },
  { cou_no:191,ward_no:48, name:"Girishbhai Arvindbhai Patel",           party:"BJP",   gender:"M", phone:"9898674111, 9825927049",       email:"girishpatel6303@gmail.com" },
  { cou_no:192,ward_no:48, name:"Sushilbhai Rajkumar Rajput",            party:"BJP",   gender:"M", phone:"9313360439, 8735071143",       email:"sushilrajput043@gmail.com" },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching zones and wards from DB…");
  const { data: zones } = await supabase.from("zones").select("id, name");
  const { data: wards } = await supabase.from("wards").select("id, ward_number, name");
  if (!zones || !wards) return console.error("Could not load zones/wards.");
  const zoneByName = Object.fromEntries(zones.map((z) => [z.name, z.id]));
  const wardByNum  = Object.fromEntries(wards.map((w) => [w.ward_number, w]));
  console.log(`  ${zones.length} zones, ${wards.length} wards loaded.`);

  // 1. Update ward names & zones where they differ from the official PDF.
  console.log("\n1. Updating ward names/zones…");
  let wardUpdated = 0;
  for (const [numStr, info] of Object.entries(WARD_CORRECTIONS)) {
    const wardNum = Number(numStr);
    const dbWard  = wardByNum[wardNum];
    if (!dbWard) { console.warn(`  Ward ${wardNum} not found in DB`); continue; }
    const zoneId  = zoneByName[info.zone];
    if (!zoneId)  { console.warn(`  Zone "${info.zone}" not found`); continue; }
    if (dbWard.name !== info.name) {
      const { error } = await supabase
        .from("wards")
        .update({ name: info.name, zone_id: zoneId })
        .eq("id", dbWard.id);
      if (error) console.error(`  Ward ${wardNum}: ${error.message}`);
      else { console.log(`  Ward ${wardNum}: "${dbWard.name}" → "${info.name}"`); wardUpdated++; }
    }
  }
  console.log(`  ${wardUpdated} ward names updated.`);

  // 2. Remove all existing corporators (clean slate).
  console.log("\n2. Removing old corporators…");
  const { data: oldCorps } = await supabase
    .from("representatives")
    .select("id")
    .eq("role", "corporator");
  if (oldCorps?.length) {
    const ids = oldCorps.map((r) => r.id);
    await supabase.from("ward_representatives").delete().in("representative_id", ids);
    await supabase.from("representatives").delete().in("id", ids);
    console.log(`  Deleted ${ids.length} old corporators.`);
  }

  // 3. Insert new corporators + ward_representatives mapping.
  console.log("\n3. Inserting 191 councillors (1 seat vacant)…");
  const active = COUNCILLORS.filter((c) => c.name && !c.name.startsWith("Vacant"));
  const repRows = active.map((c) => ({
    name:           c.name,
    role:           "corporator",
    party:          c.party,
    constituency:   `Ward ${c.ward_no} — ${WARD_CORRECTIONS[c.ward_no]?.name ?? ""}`,
    phone:          c.phone,
    email:          c.email,
    twitter_handle: null,
    photo_url:      null,
  }));

  // Insert in one batch.
  const { data: inserted, error: insErr } = await supabase
    .from("representatives")
    .insert(repRows)
    .select("id");
  if (insErr) return console.error("Insert error:", insErr.message);
  console.log(`  ${inserted.length} representatives inserted.`);

  // Build ward_representatives rows.
  const mappings = active.map((c, i) => ({
    ward_id:           wardByNum[c.ward_no]?.id,
    representative_id: inserted[i].id,
  })).filter((m) => m.ward_id);

  const { error: mapErr } = await supabase.from("ward_representatives").insert(mappings);
  if (mapErr) return console.error("Mapping error:", mapErr.message);
  console.log(`  ${mappings.length} ward↔councillor links created.`);

  console.log("\n✅ Done! Corporators seeded from official AMC 2025 PDF.");
  console.log("\nRemember to drop temp seed policies after seeding:");
  console.log('  DROP POLICY "Temp seed ward_representatives" ON ward_representatives;');
  console.log('  DROP POLICY "Temp seed representatives" ON representatives;');
  console.log('  DROP POLICY "Temp delete representatives" ON representatives;');
  console.log('  DROP POLICY "Temp delete ward_representatives" ON ward_representatives;');
}

main().catch(console.error);
