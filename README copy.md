<!-- # Savepoint5
YUNG INDEX yung working (savepoint.)

YUNG index_slight_changes.html nagkaroon ng bug nung may binago ako ng konti sa html.  pero ito yung latest.










Yung Payroll sa may navigation bar > Attendance
-Kapag nag drag and drop ng Attendance file dapat automatic na mag pplot yung data na yun "attendance"
 sa system natin.   "Main_(January)Attendance report.xls"

 Kasi currently yung file lang na ginagamit natin to analyze the Timecard is prompted lang ng AI
 Kasi now lang ako sinendan ng File na actual nilang gagamit for Attendance Time card.

 To test, yung file na ginagamit ko right now is "attendance_Dec_16-32.xlsx" which is yung purpose lang to check
 if gumagana ba yung Excel data extraction na yun. So hindi pa talaga align yung format ng current code natin sa
 actual file na ginagamit nila.

 Ano ba yung purpose bakit may Attendance attendance sa payroll?
 Yung purpose nyan is para makita yung computed sahod ng employee base sa kanilang worked hours, hours of Over time (which is makukuha lang yung total hours na yun based sa approved Over time request nila.
 
 Hindi kasi na ccredit yung Over time kapag hindi sila nag apply ng request and hindi rin approved my management. That's why may Over time request sa may Request Nav panel natin, and kapag na approve, automatic syang maccredit sa accounts nung employee na yun, na may credited hours of Over Time na sya.)

 So kahit mag exceed yung Total work hours ng employee sa required hours nya (meaning nag over time sya) pero hindi nag apply ng Overtime request and hindi na approve, automatic hindi yun counted.



 Ano yung laman ng dashboard?
 Inventory Status
 -dapat makita yung available stock, out of stock, expiring soon the same from the current inventory.

 -total price ng lahat ng available stocks na ready to benta (kunwari may 1000pcs ako ng ballpen na tig 10 isa bali 10,000 lalabas sa total assets ko.)

 -liabilities makukuha sa payroll (total na need ipasahod, mga perang palabas or kailangan bayaran.)

 -revenue (total na nabenta.)


===============================================================

 Purpose of Today, This Month, This year sa Dashboard

 Yung purpose nyan is para makita yung data changes, charts, recent transaction, alerts for Today, for this month, for this year.


==============================================================

Inventory in my navigation (Inventory Management)

All, Low stock, Out of stock, Add Product.

If pinindot yung "All" maviview dapat yung All product update sa current stock and sales sa specific date na yun.

bali pareparehas lang lahat ng products sa lahat ng date.
bali kapag nag add ka ng panibagong product, ma aadd sya sa global (meaning kahit anong date i select mo nandon yung bagong add na product.)

bali sa mga future events kunwari, bukas or etc... yung current stock and sales non is 0 or pending pa.

Every end ng araw yung save ng current stock and sales.

Kunwari Today,january 31 2026, 11:58pm, yuung current stock ko sa item1 is 20 and sales ko naman is 100pcs.

Pag sapit ng 12:00am, feb 1 2026, nakasave na yun bawal na madagdagan at mabawasan, automatic na syang lilipat sa panibagong araw, and automatic back to 0 yung sales and kung ilang stocks yung naiwan sa previous day is ayun naman yung mapupunta sa current stock sa feb 1.

bali mapupunta lang yung previous stock, or yung naiwang stock kahapon sa current day, pero pag pupunta ka sa feb 2 for example, yung stock non and sales is 0.

Pero pag bumalik ka sa january 31, 2026 dapat ma viview mo ulit kung ano yung na save na current stocks non sa araw na yun.



Kapag pinindot yung "Low Stock" dapat lalabasa lahat ng low stock sa current date na yun.

Kapag pinindot yung "Out of Stocl" dapat lalabas lahat ng out of stock.


"Add Product" para makapag add ka ng product sa list, hindi required na mag add agad ng Quantity kasi meron naman tayong Restock Checklist, kung saan jan ka mag uupdate ng stocks, kung may bagong stocks na dumating, mag update ng price.

Yung purpose ng Manual Inventory Update is kapag nagkaroon ng changes sa system na hindi sakop ng system natin, kunwari nagkaroon ng error, hindi na record ng system natin dahil ginawa sya manually. Yung purpose ng Manual Inventory Update is to fulfill that problem, kaya may nirerequire rin na password before ito ma access. Kasi pwede mong mabawasan madagdagan yung Sales per product. (Only applicable within the day, hindi sya pwede kapag mag momodify ka ng kahapon ganon or past events.)

==============================================================
Patient List
Laboratory Logbook

Manage Lab types (Custom preset para sa lab type, para hindi mahirap mga nurses na mag type ng mag type palagi.)

Goal
Masave yung records ng mga patients
-Name
-Date Time
-Laboratory Type
-Assigned Medtech (pending pa kasi kailangan pa kunin ng mga medtech.)


bali mangyayari kapag nag add patient ka, automatic mag mimirror yung request na yun sa Assignment nav option.

Wherein makikita ng mga medtech personal yung mga available patients na pwedeng i assign sakanya, bali depende sa medtech kung sino kukunin nyang pasyente.

Kapag na assign to me na ng medtech yung patient, automatic na dapat mag uupdate yung patient list, with name ng medtech personel sa Laboratory Logbook, instead na Pending magiging name na ni medtech na kumuha yung Assigned.


==============================================================
Sa Charge Slip
Dapat connected yung Category and items per categories sa Charge slip.

Bali parang gawaan to ng resibo
Tapos kapag pinindot save, automatic na mapupunta sa recent.
yung purpose ng recent is para ma print lahat / isa-isa yung pending resibo na dapat i print,  I modify yung resibo na nasave.

bali may ginawa akong printing server, kung saan kapag pinindot mo yung print sa website, automatic mag pprint yung documents na yun sa printing server, anywhere, kahit anong net gamit mo, wifi man or data.


bali kailangan mo pa iinstall yung server nyan eh
"How to navigate


Locate the file first open CMD

D:

cd "folder path(ex: "system-development\print-server\print-server")"
npm init -y
npm install -y
npm install express body-parser printer 
npm install cors
npm install firebase-admin
"

Sample printing lang yan, kahit ako na mag integrate nyan.
Pero kung kaya mo simulan, mas okiee.
Basta output dapat nyan mukang resibo na pwedeng ibigay sa pasyente.


==============================================================
Sales
Sa sales lalabas dito lahat ng History of purchase or na issue from charge slip.

Date time stamp, name nung patient, Nurse in charge (account na ginamit), items breakdown, total.

so may, option na, Today, This Month, This Year.

Kapag pinindot yung export to excel dapat lalabas yung Sales if naka pindo yung Today, so sales ng today lang, if naka select yung This Month, dapat yung exported file of sales is For this month (accumulation to ng sales this month).

If this year, all ng Sales, ma eexport na excel file ng maayos ang format.
==============================================================

Request, Dito mag apply ng sick leave/ vacation leave, Overtime request na convertible to Pera or sahod.

kapag hindi mo ginamit sick leave mo or vacation leave mo ma coconvert to sahod sya.

kapag nag overtime ka naman tapos na approve ma coconvert ito sa pera (sahod mo).


==============================================================
Print, Dito mo i uupload yung exported Payroll file na ma gegenerate ng web system natin from computed sahod.

Drag and drop mo lang then ready to print na sa printer server.


==============================================================
Assignment.

Dito sa part na to, dito makikita ng mga medtech yung mga Pending Patient na to be assign.

yung mga medtech bahala kung kukunin nila yung pasyente na yun or hindi, kapag kinuha nila dapat mag uupdate yung patient list "Assigned" from pending to the name of the medtech personel na kumuha (pumindot ng "assign to me.)




May tatlong account
delete na yung Owner

-Admin nalang
-Nurse
-Medtech



Sa admin as is kung anong meron ngayon.

Sa nurse
Patient List
Charge Slip
Request
Settings



Sa Medtech
Assignment
Request
Settings







other notes:
Yung sa OT, it should be computed per hour and per minute depende sa daily rate ng staff

  -->
