
"use strict";
/* Cloud configuration — in the project build this object comes from
   js/config.js (copy config.example.js). Leave the placeholders to run
   fully local; fill them to enable Supabase sync. Publishable key ONLY —
   never a service_role key in frontend code. */
window.MALIYA_CONFIG = window.MALIYA_CONFIG || {
  SUPABASE_URL: "YOUR-PROJECT.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "YOUR-PUBLISHABLE-KEY"
};

/* ============================================================
   MODULE: I18N — dictionaries + language/direction handling
   ============================================================ */
const I18N = (() => {
  const dict = {
    ar: {
      "app.title":"مالية",
      "nav.home":"الرئيسية","nav.money":"المال","nav.plan":"التخطيط","nav.more":"المزيد",
      "a11y.toggleTheme":"تبديل المظهر","a11y.quickAdd":"إضافة سريعة",
      "common.cancel":"إلغاء","common.save":"حفظ","common.confirm":"تأكيد",
      "common.sar":"ر.س","common.month":"شهريًا","common.day":"يوم","common.days":"يوم",
      "hero.netBalance":"صافي الرصيد المتاح","hero.salary":"الراتب","hero.monthlyOut":"الالتزامات الشهرية",
      "stat.fixed":"التزامات ثابتة","stat.temp":"أقساط مؤقتة","stat.child":"تكاليف الأطفال",
      "stat.remaining":"المتبقي المتوقع من الراتب","stat.surplus":"فائض شهري","stat.deficit":"عجز شهري",
      "stat.afterAll":"بعد كل الالتزامات",
      "dash.commitments":"ملخص الالتزامات","dash.endingSoon":"تنتهي قريبًا","dash.trip":"رحلة اليابان 🇯🇵",
      "dash.health":"الصحة المالية","dash.insight":"نظرة سريعة",
      "dash.frees":"يتحرر","dash.endsIn":"تنتهي خلال","dash.ended":"انتهت",
      "dash.tripDays":"يوم متبقي على السفر","dash.tripDates":"١٧–٢٤ نوفمبر ٢٠٢٦ · طوكيو",
      "dash.travelers":"مسافرين","dash.tripPhase":"تفاصيل الميزانية والحجوزات في المرحلة 5",
      "health.low":"تحتاج انتباه","health.mid":"في تحسّن","health.good":"وضع جيد","health.great":"وضع ممتاز",
      "empty.money.t":"الحسابات والمعاملات",
      "empty.money.p":"هنا راح تديرين حساباتك، دخلك، ومصاريفك — مع بحث وفلاتر وتحويل بين الحسابات.",
      "empty.phase2":"تنبنى في المرحلة 2","empty.phase36":"تنبنى في المراحل 3–6",
      "empty.plan.t":"الالتزامات والتخطيط",
      "empty.plan.p":"الالتزامات، الأقساط، العمالة المنزلية، رحلة اليابان، والتوقعات الشهرية — كل قسم يجي في مرحلته.",
      "set.appearance":"المظهر","set.theme":"الثيم","set.theme.light":"فاتح","set.theme.dark":"غامق","set.theme.system":"تلقائي",
      "set.accent":"اللون الأساسي","set.langRegion":"اللغة والتنسيق","set.lang":"اللغة","set.lang.s":"تغيّر الاتجاه تلقائيًا",
      "set.numerals":"الأرقام","set.dateFormat":"تنسيق التاريخ","set.currency":"العملة","set.currency.s":"رمز العملة الافتراضي",
      "set.financialMonth":"الشهر المالي","set.salaryDay":"يوم الراتب","set.salaryDay.s":"يوم نزول الراتب من كل شهر",
      "set.monthStart":"بداية الشهر المالي","set.monthStart.s":"اليوم اللي تبدأ منه حساباتك الشهرية",
      "set.data":"البيانات والنسخ الاحتياطي","set.export":"تصدير نسخة JSON","set.import":"استيراد نسخة",
      "set.reset":"إعادة ضبط التطبيق",
      "set.data.hint":"بياناتك محفوظة محليًا على جهازك فقط. صدّري نسخة احتياطية بشكل دوري وقبل أي تحديث للتطبيق.",
      "quick.title":"إضافة سريعة","quick.balance.t":"تحديث رصيد الحساب","quick.balance.s":"عدّلي الرصيد الحالي لأي حساب",
      "quick.backup.t":"نسخة احتياطية الآن","quick.backup.s":"تصدير كل بياناتك كملف JSON",
      "quick.hint":"تسجيل الدخل والمصاريف يفتح هنا ابتداءً من المرحلة 2.",
      "bal.title":"تحديث الرصيد","bal.account":"الحساب","bal.newBalance":"الرصيد الجديد",
      "bal.err":"أدخلي مبلغًا صحيحًا (أرقام فقط، ويسمح بالفواصل العشرية)",
      "toast.saved":"تم الحفظ ✓","toast.exported":"تم تصدير النسخة الاحتياطية ✓",
      "toast.imported":"تم استيراد البيانات بنجاح ✓","toast.reset":"تمت إعادة الضبط",
      "toast.importBad":"الملف غير صالح — تأكدي إنه نسخة مصدّرة من مالية",
      "confirm.reset.t":"إعادة ضبط التطبيق؟","confirm.reset.b":"راح تنحذف كل بياناتك من هذا الجهاز وترجع البيانات الأولية. ننصحك بتصدير نسخة احتياطية أولًا.",
      "confirm.reset.y":"نعم، إعادة الضبط",
      "confirm.import.t":"استيراد النسخة؟","confirm.import.b":"البيانات الحالية راح تُستبدل بالكامل ببيانات الملف. هل تريدين المتابعة؟",
      "confirm.import.y":"نعم، استيراد",
      "insight.deficit":"التزاماتك هذا الشهر أعلى من راتبك بحوالي {amt}. الرصيد الحالي يغطي الفرق، وفي أغسطس ينتهي قسط أوناس والحضانة فيتحرر {freed} شهريًا ويتحول وضعك لفائض.",
      "insight.surplus":"عندك فائض شهري تقريبًا {amt}. توجيه جزء منه لرحلة اليابان يخليك على المسار الصحيح قبل نوفمبر.",
      "money.tab.accounts":"الحسابات","money.tab.tx":"المعاملات","money.tab.cats":"التصنيفات",
      "acc.total":"إجمالي الصافي","acc.add":"إضافة حساب","acc.none":"ما فيه حسابات نشطة",
      "acc.archived":"مؤرشفة","acc.excluded":"خارج الصافي","acc.history":"آخر الحركات",
      "acc.type.bank":"حساب بنكي","acc.type.savings":"ادخار","acc.type.cash":"نقد","acc.type.card":"بطاقة ائتمانية","acc.type.wallet":"محفظة رقمية",
      "acc.form.add":"حساب جديد","acc.form.edit":"تعديل الحساب","acc.name":"اسم الحساب","acc.type":"النوع",
      "acc.balance":"الرصيد الحالي","acc.bank":"اسم البنك (اختياري)","acc.includeNet":"يُحتسب ضمن الصافي",
      "acc.cantDelete":"الحساب مرتبط بمعاملات — أرشفيه بدل الحذف","acc.cantDeleteLast":"لازم يبقى حساب واحد على الأقل",
      "acc.transfer":"تحويل",
      "common.notes":"ملاحظات (اختياري)","common.edit":"تعديل","common.delete":"حذف",
      "common.archive":"أرشفة","common.unarchive":"إلغاء الأرشفة","common.duplicate":"تكرار",
      "common.err.required":"هذا الحقل مطلوب","common.err.amount":"أدخلي مبلغًا صحيحًا أكبر من صفر",
      "common.err.date":"أدخلي تاريخًا صحيحًا","common.all":"الكل",
      "tx.new.expense":"مصروف جديد","tx.new.income":"دخل جديد","tx.edit":"تعديل المعاملة",
      "tx.kind.expense":"مصروف","tx.kind.income":"دخل",
      "tx.name":"الاسم","tx.amount":"المبلغ","tx.date":"التاريخ","tx.account":"الحساب","tx.category":"التصنيف",
      "tx.uncat":"غير مصنف","tx.fixed":"ثابت","tx.variable":"متغير","tx.essential":"أساسي",
      "tx.paid":"مدفوع","tx.pending":"معلّق","tx.recurring":"التكرار","tx.status":"الحالة",
      "tx.rec.none":"مرة واحدة","tx.rec.weekly":"أسبوعي","tx.rec.monthly":"شهري","tx.rec.yearly":"سنوي",
      "tx.markPaid":"تحديد كمدفوع","tx.markPending":"إرجاع لمعلّق",
      "tx.details":"تفاصيل المعاملة","tx.dupDone":"تم إنشاء نسخة ✓",
      "tx.empty.t":"ما فيه معاملات بعد","tx.empty.p":"ابدئي بتسجيل أول مصروف أو دخل من زر الإضافة (+)",
      "tx.filtered.t":"ما فيه نتائج مطابقة","tx.filtered.p":"جربي تعديل البحث أو الفلاتر","flt.clear":"مسح الفلاتر",
      "tr.title":"تحويل بين الحسابات","tr.from":"من حساب","tr.to":"إلى حساب","tr.err.same":"اختاري حسابين مختلفين",
      "tr.name":"تحويل","tr.needTwo":"أضيفي حسابًا ثانيًا أولًا عشان تقدرين تحوّلين",
      "tr.meta":"من {from} إلى {to}",
      "flt.search":"بحث بالاسم أو الملاحظات أو المبلغ…","flt.kind":"النوع","flt.status":"الحالة",
      "cat.add":"إضافة تصنيف","cat.expense":"مصاريف","cat.income":"دخل","cat.subs":"فرعي",
      "cat.form.add":"تصنيف جديد","cat.form.edit":"تعديل التصنيف","cat.icon":"الأيقونة","cat.parent":"التصنيف الأب",
      "cat.parent.none":"بدون (تصنيف رئيسي)","cat.hasChildren":"احذفي التصنيفات الفرعية أولًا",
      "cat.inUse.t":"التصنيف مستخدم","cat.inUse.b":"فيه معاملات مرتبطة بهذا التصنيف. حذفه راح يخليها بدون تصنيف. متابعة؟",
      "confirm.del.t":"تأكيد الحذف","confirm.del.b":"هذا الإجراء ما ينرجع. متأكدة من الحذف؟","confirm.del.y":"نعم، حذف",
      "dash.income":"دخل هذا الشهر","dash.expense":"مصاريف هذا الشهر","dash.pending":"معلّق:",
      "dash.since":"من {d}","dash.recent":"آخر المعاملات","dash.viewAll":"عرض الكل",
      "quick.expense.t":"مصروف جديد","quick.expense.s":"سجّلي مصروفًا من أي حساب",
      "quick.income.t":"دخل جديد","quick.income.s":"راتب، مكافأة، استرداد…",
      "quick.transfer.t":"تحويل بين الحسابات","quick.transfer.s":"ما يُحتسب دخل ولا مصروف",
      "plan.tab.all":"الكل","plan.tab.bills":"فواتير","plan.tab.loans":"أقساط وقروض",
      "cm.summary":"إجمالي المجموعة شهريًا","cm.paidOf":"مدفوع {p} من {t} هذا الشهر",
      "cm.add":"إضافة التزام","cm.form.add":"التزام جديد","cm.form.edit":"تعديل الالتزام",
      "cm.kind.bill":"فاتورة ثابتة","cm.kind.loan":"قرض","cm.kind.installment":"قسط",
      "cm.provider":"الجهة / المزوّد (اختياري)","cm.monthly":"الدفعة الدورية","cm.original":"المبلغ الأصلي (اختياري)",
      "cm.count":"عدد الدفعات (اختياري)","cm.dueDay":"يوم الاستحقاق","cm.freq":"تكرار الدفع",
      "cm.freq.monthly":"شهري","cm.freq.quarterly":"ربع سنوي","cm.freq.yearly":"سنوي",
      "cm.start":"تاريخ البداية (اختياري)","cm.end":"تاريخ النهاية (اختياري)",
      "cm.priority":"الأولوية","cm.pr.high":"عالية","cm.pr.normal":"عادية","cm.pr.low":"منخفضة",
      "cm.err.day":"من 1 إلى 31","cm.err.endBeforeStart":"تاريخ النهاية قبل البداية",
      "cm.payNow":"تسجيل الدفعة","cm.paid":"مدفوع ✓","cm.overdue":"متأخر",
      "cm.inDays":"بعد {n} يوم","cm.upcoming":"دفعات قادمة","cm.manage":"إدارة",
      "cm.undo":"تراجع عن الدفعة","cm.pause":"إيقاف مؤقت","cm.resume":"استئناف",
      "cm.settle":"سداد مبكر","cm.settle.hint":"تُسجّل دفعة واحدة ويُقفل الالتزام نهائيًا.",
      "cm.unsettle":"تراجع عن السداد المبكر",
      "cm.remainBal":"الرصيد المتبقي","cm.remainPay":"دفعات متبقية","cm.nextPay":"الدفعة القادمة",
      "cm.endsOn":"ينتهي في","cm.endsIn":"ينتهي خلال {n} يوم","cm.freesAfter":"يتحرر بعد الاكتمال",
      "cm.history":"سجل الدفعات","cm.noHistory":"ما فيه دفعات مسجلة بعد",
      "cm.completed":"مكتمل","cm.pausedChip":"موقوف","cm.archivedChip":"مؤرشف","cm.endedChip":"انتهى",
      "cm.dupPay":"الدفعة مسجلة لهذه الفترة — تراجعي عنها أولًا",
      "cm.done":"🎉 اكتمل الالتزام","cm.paySaved":"تم تسجيل الدفعة ✓","cm.undone":"تم التراجع ✓",
      "cm.editPay":"تعديل الدفعة","cm.delPay.b":"راح تنحذف الدفعة ومعاملتها وينرجع المبلغ للحساب. متابعة؟",
      "cm.del.b":"حذف الالتزام ما يحذف دفعاته السابقة من سجل المعاملات. متأكدة؟",
      "cm.release":"تحسّن التدفق الشهري","cm.release.s":"وش يتحرر لك مع نهاية كل التزام",
      "cm.cum":"الإجمالي المتحرر",
      "cm.st.active":"نشط","cm.st.paused":"موقوف","cm.st.completed":"مكتمل","cm.st.archived":"مؤرشف",
      "cm.sort.due":"يوم الاستحقاق","cm.sort.amount":"المبلغ","cm.sort.end":"تاريخ النهاية","cm.sort.name":"الاسم",
      "cm.account":"حساب الدفع","cm.none.t":"ما فيه التزامات مطابقة","cm.none.p":"جربي تغيير الفلاتر، أو أضيفي التزامًا جديدًا",
      "cm.payDate":"تاريخ الدفع","cm.payment":"دفعة",
      "plan.sec.cm":"الالتزامات","plan.sec.family":"العائلة",
      "fam.title":"لوحة العائلة","fam.staff":"العمالة المنزلية","fam.children":"الأطفال",
      "fam.staffMonthly":"العمالة شهريًا","fam.kidsMonthly":"الأطفال شهريًا","fam.total":"الإجمالي الشهري",
      "wk.add":"إضافة عاملة","wk.form.add":"عاملة جديدة","wk.form.edit":"تعديل بيانات العاملة",
      "wk.role":"النوع","wk.role.temp":"مؤقتة","wk.role.permanent":"دائمة (استقدام)","wk.role.other":"أخرى",
      "wk.salary":"الراتب الشهري","wk.discount":"خصم ٪ (اختياري)","wk.net":"الصافي شهريًا",
      "wk.window":"نافذة الوصول","wk.startsIn":"تبدأ بعد {n} يوم","wk.started":"بدأت {d}",
      "wk.activate":"تفعيل وبدء الراتب","wk.activate.hint":"راح ينشأ التزام شهري باسمها ويدخل ضمن التزاماتك ولوحتك.",
      "wk.startDate":"تاريخ البدء","wk.payDay":"يوم صرف الراتب","wk.cmName":"راتب {n}",
      "wk.paySalary":"تسجيل الراتب","wk.end":"إنهاء العمل",
      "wk.end.b":"راح يُقفل التزام الراتب ويطلع من الإجماليات، وتبقى الدفعات السابقة في السجل. متابعة؟",
      "wk.st.expected":"متوقعة","wk.st.active":"نشطة","wk.st.ended":"منتهية",
      "wk.del.b":"حذف العاملة يحذف التزام راتبها، وتبقى دفعاته السابقة في سجل المعاملات. متأكدة؟",
      "sc.title":"سيناريوهات العمالة","sc.s":"تقدير شهري — شهر التسليم يُحسب فيه الطرفان (تقدير متحفظ)، والمؤقتة تنتهي مع وصول الدائمة.",
      "sc.a":"وصول مبكر ({d})","sc.b":"وصول متأخر ({d})","sc.total":"الإجمالي","sc.diff":"فرق السيناريوهين",
      "ch.add":"إضافة طفل","ch.form.add":"ملف طفل جديد","ch.form.edit":"تعديل ملف الطفل",
      "ch.emoji":"رمز (إيموجي)","ch.monthly":"شهريًا","ch.items":"البنود المرتبطة",
      "ch.noItems":"ما فيه بنود مرتبطة بعد — اربطي التزامًا من الزر تحت",
      "ch.attach":"ربط التزام","ch.attach.pick":"اختاري الالتزام","ch.detach":"فك",
      "ch.noneToAttach":"كل الالتزامات النشطة مربوطة أو ما فيه التزامات",
      "ch.del.b":"حذف الملف يفك ربط البنود بدون حذفها من الالتزامات. متأكدة؟",
      "plan.sec.travel":"الرحلات",
      "trip.add":"إضافة رحلة","trip.form.add":"رحلة جديدة","trip.form.edit":"تعديل الرحلة",
      "trip.dest":"الوجهة","trip.start":"تاريخ الذهاب","trip.end":"تاريخ العودة",
      "trip.target":"الميزانية المستهدفة","trip.saved":"المدّخر لها","trip.status":"الحالة",
      "trip.st.planning":"تخطيط","trip.st.booked":"محجوزة","trip.st.active":"جارية","trip.st.done":"منتهية",
      "trip.travelers":"المسافرون (افصلي بينهم بفاصلة)","trip.travelersT":"المسافرون",
      "trip.back":"→ الرحلات","trip.daysTo":"يوم على السفر","trip.nights":"{n} ليالٍ · {d} أيام",
      "trip.budget":"ميزانية الرحلة","trip.planned":"المخطط","trip.paidT":"المدفوع","trip.remaining":"المتبقي من الميزانية",
      "trip.overPlan":"المخطط يتجاوز الميزانية بمقدار {amt}","trip.paidOfTarget":"مدفوع {p} من {t}",
      "trip.readiness":"الجاهزية","trip.readiness.s":"محجوز {b}/{i} · مدفوع {p}/{i} · القائمة {c}/{ct}",
      "trip.daily":"المصروف اليومي","trip.daily.s":"ميزانية يومية أثناء الرحلة","trip.daily.total":"إجمالي {d} أيام",
      "trip.daily.hint":"اقتراح: {amt}/يوم من المتبقي بعد المخطط",
      "trip.items":"بنود الرحلة","trip.item.add":"إضافة بند","trip.item.form.add":"بند جديد","trip.item.form.edit":"تعديل البند",
      "trip.item.planned":"المبلغ المخطط","trip.item.due":"تاريخ الاستحقاق (اختياري)","trip.item.ref":"رقم الحجز (اختياري)",
      "trip.item.booked":"محجوز","trip.item.notBooked":"غير محجوز",
      "trip.cat.flights":"طيران","trip.cat.hotel":"فندق","trip.cat.visa":"تأشيرات","trip.cat.tickets":"تذاكر وفعاليات",
      "trip.cat.transport":"مواصلات","trip.cat.food":"مأكولات","trip.cat.shopping":"تسوق","trip.cat.other":"أخرى",
      "trip.pay":"تسجيل الدفع","trip.unpay":"تراجع عن الدفع","trip.paidChip":"مدفوع ✓","trip.bookedChip":"محجوز",
      "trip.unpay.b":"راح تنحذف معاملة الدفع وينرجع المبلغ للحساب. متابعة؟",
      "trip.item.del.b":"حذف البند ما يحذف معاملة دفعه من السجل إن وجدت. متأكدة؟",
      "trip.checklist":"قائمة الجاهزية","trip.cl.add":"أضيفي مهمة…",
      "trip.del.b":"حذف الرحلة يحذف بنودها وقائمتها، وتبقى معاملات الدفع في السجل. متأكدة؟",
      "trip.none.t":"ما فيه رحلات","trip.none.p":"أضيفي رحلتك الأولى من الزر تحت",
      "plan.sec.planner":"الشهري",
      "pl.dashTitle":"خطة {m}","pl.surplus":"فائض مخطط","pl.deficit":"عجز مخطط",
      "pl.plannedIn":"دخل مخطط","pl.plannedOut":"صرف مخطط","pl.alerts":"تنبيهات",
      "pl.month":"مخطط الشهر","pl.net":"الصافي المخطط",
      "pl.actual":"الفعلي حتى الآن","pl.actualIn":"دخل فعلي","pl.actualOut":"صرف فعلي",
      "pl.timeline":"التقويم المالي","pl.timeline.s":"كل الدفعات المتوقعة بترتيب أيامها — دورة الراتب يوم {d}",
      "pl.salary":"الراتب الشهري","pl.expectedChip":"متوقع","pl.day":"اليوم",
      "pl.extra.add":"إضافة بند مخطط","pl.extra.form.add":"بند مخطط جديد","pl.extra.form.edit":"تعديل البند المخطط",
      "pl.extra.hint":"بند تخطيطي لهذا الشهر — ما يأثر على الرصيد إلا لما تسجلينه كمعاملة.",
      "pl.extra.record":"تسجيل كمعاملة","pl.extra.undo":"تراجع عن التسجيل",
      "pl.extra.undo.b":"راح تنحذف المعاملة وينرجع أثرها من الحساب. متابعة؟",
      "pl.extra.del.b":"حذف البند المخطط ما يلمس أي معاملة مسجلة سابقًا. متأكدة؟",
      "pl.alerts.t":"تنبيهات الشهر","pl.al.deficit":"الخطة بعجز {amt} هذا الشهر",
      "pl.al.overdue":"{n} دفعة متأخرة تحتاج تسجيل","pl.al.trip":"{n} بند رحلة يستحق هذا الشهر",
      "pl.al.frees":"ينتهي {name} هذا الشهر — يتحرر {amt} شهريًا بعده",
      "pl.forecast":"توقعات ١٢ شهرًا","pl.forecast.s":"الرصيد التراكمي يبدأ من رصيدك الحالي؛ الشهر الأول يحسب المتبقي فقط.",
      "pl.sc.best":"متفائل","pl.sc.expected":"متوقع","pl.sc.worst":"متحفظ",
      "pl.sc.hint":"الراتب والالتزامات ثابتة بكل السيناريوهات؛ يتغير الصرف المرن (٨٥٪/١١٥٪) وشهر وصول العمالة (الأرخص/الأغلى).",
      "pl.col.in":"دخل","pl.col.out":"صرف","pl.col.net":"صافي","pl.col.cum":"الرصيد",
      "pl.whatif":"ماذا لو؟","pl.wf.flex":"صرف مرن شهري إضافي","pl.wf.salary":"تغيير الراتب (+/−)",
      "pl.wf.staff":"سيناريو وصول الدائمة","pl.wf.a":"مبكر","pl.wf.b":"متأخر",
      "plan.sec.advisor":"المستشار",
      "adv.title":"المستشار المالي","adv.sub":"تحليل مبني على بياناتك وأرقامك الفعلية فقط",
      "adv.src.actual":"فعلي","adv.src.planned":"مخطط","adv.src.forecast":"توقع","adv.src.scenario":"سيناريو",
      "adv.p1":"عاجل","adv.p2":"مهم","adv.p3":"فرص ومعلومات",
      "adv.dismiss":"إخفاء","adv.showHidden":"إظهار المخفي ({n})","adv.noInsights":"ما فيه ملاحظات حاليًا — وضعك مستقر 🌿",
      "adv.go":"انتقال",
      "adv.score.t":"شرح نقاط الصحة المالية","adv.score.load":"حمل الالتزامات: {out} من راتب {sal} ({pct}٪) → {pts}/55 نقطة",
      "adv.score.buffer":"الاحتياطي: رصيدك {bal} يغطي {m} شهر التزامات → {pts}/35 نقطة",
      "adv.score.bonus":"مكافأة قرب التحرر: عجزك الحالي ينقلب مع نهاية أقساط قريبة → +{pts}/10",
      "adv.score.nobonus":"مكافأة قرب التحرر: غير مفعّلة حاليًا (0/10)",
      "adv.i.overdue.t":"{n} دفعة متأخرة بمجموع {amt}","adv.i.overdue.b":"تسجيلها يضبط أرقام الشهر ويوقف تراكم التأخير.",
      "adv.i.deficit.t":"خطة الشهر بعجز {amt}","adv.i.deficit.b":"الدخل المخطط {inc} والصرف المخطط {out}. العجز مؤقت — ينخفض مع نهاية الأقساط.",
      "adv.i.lowpoint.t":"الرصيد المتوقع يهبط لأدنى نقطة في {m}: {amt}","adv.i.lowpoint.b":"بسيناريو \"متوقع\" (يشمل بنود الرحلة غير المدفوعة). وزّعي مدفوعات الرحلة أو قدّمي بعضها لتنعيم المنحنى.",
      "adv.i.negative.t":"تحذير: الرصيد المتوقع يصير سالبًا في {m} ({amt})","adv.i.negative.b":"حسب توقع {months} شهرًا بسيناريو \"متوقع\". أكبر مسبب: دفعات {reason}.",
      "adv.i.release.t":"يتحرر {amt} شهريًا بعد {m}","adv.i.release.b":"مع نهاية {name}. إجمالي المتحرر حتى {lastM}: {cum} شهريًا — فرصة ممتازة لقاعدة ادخار تلقائية.",
      "adv.i.discount.t":"خصم العاملة المؤقتة غير مفعّل","adv.i.discount.b":"لو تأكد خصم ٢٠٪ على {sal}: توفير {save} شهريًا. حدّثيه من العائلة ← تعديل.",
      "adv.i.staffdiff.t":"فرق سيناريوهي وصول الدائمة: {amt}","adv.i.staffdiff.b":"الوصول المبكر يكلف {a} والمتأخر {b} خلال ٦ أشهر. الرقم للتخطيط فقط.",
      "adv.i.trip.t":"بنود الرحلة غير المدفوعة {amt}","adv.i.trip.b":"الرصيد المتوقع قبل {m}: {cum}. {verdict}",
      "adv.i.trip.short":"أقل من المطلوب — يفيد تقديم بعض المدفوعات في أشهر الفائض.","adv.i.trip.okv":"يغطيها بحسب التوقع الحالي.",
      "adv.i.settle.t":"أقرب قسط للنهاية: {name}","adv.i.settle.b":"متبقيه {amt} على {n} دفعات وينتهي في {m}. سداده المبكر خيار إن رغبتي بتقليل الالتزامات — القرار لك.",
      "adv.i.surplus.t":"{n} أشهر فائض قادمة","adv.i.surplus.b":"أعلاها {m} بفائض {amt}. جدولة التحويل للادخار في هذه الأشهر تبني الاحتياطي بدون ضغط.",
      "adv.an.spend":"تحليل الصرف","adv.an.spend.total":"صرف {m} الفعلي: {amt} ({pct}٪ من المخطط {plan})",
      "adv.an.spend.none":"ما فيه مصاريف مسجلة هذا الشهر بعد",
      "adv.an.cash":"تحليل التدفق","adv.an.cash.b":"أدنى رصيد متوقع: {min} في {minM} · أعلى: {max} في {maxM} · أشهر الفائض: {n}/12",
      "adv.an.cm":"تحليل الالتزامات","adv.an.cm.b":"{n} التزام نشط بمجموع {amt} شهريًا ({pct}٪ من الراتب) · يتحرر {freed} شهريًا بحلول {m}",
      "adv.an.fam":"تكلفة العائلة","adv.an.fam.b":"العمالة (مخطط): {staff} · بنود الأطفال: {kids} · المجموع {tot} ({pct}٪ من الراتب)",
      "adv.an.trip":"ميزانية الرحلة","adv.an.trip.b":"المستهدف {t} · المخطط {p} · المدفوع {paid} · غير المدفوع {un} · الجاهزية {r}٪",
      "adv.ask":"اسأليني عن أرقامك","adv.ask.ph":"مثال: متى ينتهي قسط أوناس؟",
      "adv.ask.btn":"اسألي","adv.ask.hint":"أجاوب من بياناتك المخزنة محليًا فقط — ما أخترع أرقام.",
      "adv.ask.fallback":"ما قدرت أفهم السؤال. جربي وحدة من هذي:",
      "adv.ex.1":"كم رصيدي؟","adv.ex.2":"متى ينتهي قسط أوناس؟","adv.ex.3":"وش وضع رحلة اليابان؟","adv.ex.4":"متى يتحسن وضعي؟",
      "adv.a.balance":"رصيدك الصافي الحالي {bal} (فعلي) موزع على {n} حساب. التزاماتك الشهرية {out}.",
      "adv.a.cm":"عندك {n} التزام نشط بمجموع {amt} شهريًا. أقربها نهاية: {name} في {m} — يتحرر بعده {freed} شهريًا.",
      "adv.a.cmOne":"{name}: دفعته {amt} شهريًا، المتبقي {rem}{end}. {paid}",
      "adv.a.cmOne.end":" وينتهي في {m}","adv.a.cmOne.paid":"دفعة هذا الشهر مسجلة ✓ (فعلي).","adv.a.cmOne.unpaid":"دفعة هذا الشهر ما انسجلت بعد.",
      "adv.a.trip":"رحلة {name}: بعد {days} يوم. المستهدف {t}، المدفوع {paid} (فعلي)، غير المدفوع {un} (مخطط)، الجاهزية {r}٪.",
      "adv.a.staff":"العمالة: {rows}. فرق سيناريوهي الوصول {diff} خلال ٦ أشهر (سيناريو).",
      "adv.a.forecast":"خطة هذا الشهر صافيها {net} (مخطط). أدنى رصيد متوقع خلال ١٢ شهرًا: {min} في {m} (توقع).",
      "adv.a.save":"أقرب تحسن: {m} يتحرر {amt} شهريًا. إجمالي المتحرر بنهاية المدى {cum} شهريًا (توقع). أشهر الفائض القادمة: {n}.",
      "adv.a.score":"نقاطك {score}/100. التفاصيل في بطاقة الشرح فوق.",
      "adv.a.salary":"راتبك {sal} يوم {d} من الشهر. {got}",
      "adv.a.salary.got":"راتب هذا الشهر مستلم ✓ (فعلي).","adv.a.salary.no":"راتب هذا الشهر ما انسجل بعد.",
      "cl.title":"الحساب والمزامنة","cl.notCfg.t":"الإعداد السحابي غير مكوّن",
      "cl.notCfg.b":"التطبيق يشتغل محليًا بالكامل. لتفعيل المزامنة: أنشئي مشروع Supabase، شغّلي ملفات SQL المرفقة، وحطي عنوان المشروع والمفتاح العام (publishable) في js/config.js — التعليمات كاملة في README.",
      "cl.st.local":"محلي فقط","cl.st.signedout":"غير مسجّلة دخول","cl.st.pending":"بانتظار الترحيل الأول",
      "cl.st.offline":"غير متصلة","cl.st.syncing":"جاري المزامنة…","cl.st.synced":"متزامنة ✓",
      "cl.st.error":"خطأ مزامنة","cl.st.conflict":"تعارض يحتاج قرارك",
      "cl.lastSync":"آخر مزامنة: {t}","cl.never":"لم تتم بعد","cl.syncNow":"مزامنة الآن",
      "cl.signIn":"تسجيل الدخول","cl.signUp":"إنشاء حساب","cl.signOut":"تسجيل الخروج",
      "cl.reset":"نسيت كلمة المرور","cl.email":"البريد الإلكتروني","cl.pass":"كلمة المرور",
      "cl.auth.t":"الدخول لحساب المزامنة","cl.auth.hint":"بياناتك تبقى معزولة بحسابك عبر سياسات RLS — ما أحد غيرك يقرأها.",
      "cl.resetSent":"أرسلنا رابط إعادة التعيين لبريدك ✓","cl.signedUp":"تم إنشاء الحساب — تحققي من بريدك إذا طُلب التأكيد",
      "cl.err.invalid":"بيانات الدخول غير صحيحة","cl.err.exists":"البريد مسجّل من قبل",
      "cl.err.net":"تعذر الاتصال — تحققي من الشبكة","cl.err.generic":"صار خطأ",
      "cl.err.empty":"اكتبي البريد وكلمة المرور",
      "cl.mig.t":"رفع بياناتك الحالية للسحابة؟","cl.mig.b":"هذا أول دخول لهذا الحساب. راح نرفع نسختك المحلية كاملة (مرة واحدة فقط)، مع الاحتفاظ بنسخة احتياطية محلية قبل الرفع، والتحقق من الأرقام بعده.",
      "cl.mig.y":"ارفعي بياناتي","cl.mig.pendingBtn":"ابدئي الترحيل الأول",
      "cl.mig.ok":"تم الترحيل والتحقق ✓","cl.mig.fail":"فشل التحقق — تم التراجع وبياناتك المحلية سليمة",
      "cl.conf.t":"تعارض بين نسختين","cl.conf.b":"السحابة فيها نسخة أحدث وعندك تعديلات محلية غير مرفوعة. اختاري وحدة — الثانية تنحفظ نسخة احتياطية محلية.",
      "cl.conf.cloud":"اعتمدي السحابة (الأحدث)","cl.conf.local":"ارفعي المحلية",
      "cl.backupCloud":"نسخة احتياطية سحابية الآن","cl.backupCloud.ok":"انحفظت نسخة سحابية ✓",
      "cl.updateReady":"تحديث جديد جاهز — أغلقي التطبيق وافتحيه",
      "cl.applied.cloud":"اعتمدنا نسخة السحابة ✓","cl.applied.local":"رفعنا نسختك المحلية ✓",
      "rep.title":"مركز التقارير","rep.month":"تقرير شهري","rep.year":"ملخص السنة {y}",
      "rep.in":"الدخل","rep.out":"المصروف","rep.net":"الصافي","rep.txCount":"{n} معاملة",
      "rep.cats":"حسب التصنيف","rep.cm":"الالتزامات","rep.cm.b":"{n} نشط · {amt} شهريًا · مدفوع خلال الشهر: {paid}",
      "rep.fam":"العائلة","rep.fam.b":"مدفوعات العمالة (السنة): {staff} · بنود الأطفال شهريًا: {kids}",
      "rep.trip":"الرحلة","rep.trip.b":"{name}: مدفوع {paid} من {t} · الجاهزية {r}٪",
      "rep.csv":"تصدير CSV","rep.print":"طباعة / PDF","rep.print.hint":"للـPDF: اختاري \"حفظ كـ PDF\" من نافذة الطباعة — أوثق طريقة بالمتصفح.",
      "rep.empty":"ما فيه معاملات في هذي الفترة",
      "month.long":["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
      "version":"الإصدار {v} · الإصدار النهائي · مخطط v8"
    },
    en: {
      "app.title":"Maliya",
      "nav.home":"Home","nav.money":"Money","nav.plan":"Planning","nav.more":"More",
      "a11y.toggleTheme":"Toggle theme","a11y.quickAdd":"Quick add",
      "common.cancel":"Cancel","common.save":"Save","common.confirm":"Confirm",
      "common.sar":"SAR","common.month":"/mo","common.day":"day","common.days":"days",
      "hero.netBalance":"Net available balance","hero.salary":"Salary","hero.monthlyOut":"Monthly commitments",
      "stat.fixed":"Fixed commitments","stat.temp":"Temporary installments","stat.child":"Children costs",
      "stat.remaining":"Expected salary remainder","stat.surplus":"Monthly surplus","stat.deficit":"Monthly deficit",
      "stat.afterAll":"after all commitments",
      "dash.commitments":"Commitments summary","dash.endingSoon":"Ending soon","dash.trip":"Japan trip 🇯🇵",
      "dash.health":"Financial health","dash.insight":"Quick insight",
      "dash.frees":"frees","dash.endsIn":"ends in","dash.ended":"ended",
      "dash.tripDays":"days until departure","dash.tripDates":"Nov 17–24, 2026 · Tokyo",
      "dash.travelers":"travelers","dash.tripPhase":"Budget & bookings arrive in Phase 5",
      "health.low":"Needs attention","health.mid":"Improving","health.good":"Healthy","health.great":"Excellent",
      "empty.money.t":"Accounts & transactions",
      "empty.money.p":"Manage your accounts, income, and expenses here — with search, filters, and transfers.",
      "empty.phase2":"Coming in Phase 2","empty.phase36":"Coming in Phases 3–6",
      "empty.plan.t":"Commitments & planning",
      "empty.plan.p":"Commitments, installments, household staff, the Japan trip, and forecasts — each arrives in its phase.",
      "set.appearance":"Appearance","set.theme":"Theme","set.theme.light":"Light","set.theme.dark":"Dark","set.theme.system":"System",
      "set.accent":"Accent color","set.langRegion":"Language & format","set.lang":"Language","set.lang.s":"Direction switches automatically",
      "set.numerals":"Numerals","set.dateFormat":"Date format","set.currency":"Currency","set.currency.s":"Default currency code",
      "set.financialMonth":"Financial month","set.salaryDay":"Salary day","set.salaryDay.s":"Day of month salary arrives",
      "set.monthStart":"Month starts on","set.monthStart.s":"Day your financial month begins",
      "set.data":"Data & backup","set.export":"Export JSON backup","set.import":"Import backup",
      "set.reset":"Reset application",
      "set.data.hint":"Your data lives only on this device. Export a backup regularly and before any app update.",
      "quick.title":"Quick add","quick.balance.t":"Update account balance","quick.balance.s":"Edit the current balance of any account",
      "quick.backup.t":"Back up now","quick.backup.s":"Export all your data as a JSON file",
      "quick.hint":"Logging income and expenses opens here starting in Phase 2.",
      "bal.title":"Update balance","bal.account":"Account","bal.newBalance":"New balance",
      "bal.err":"Enter a valid amount (numbers only, decimals allowed)",
      "toast.saved":"Saved ✓","toast.exported":"Backup exported ✓",
      "toast.imported":"Data imported successfully ✓","toast.reset":"Application reset",
      "toast.importBad":"Invalid file — make sure it's a Maliya export",
      "confirm.reset.t":"Reset the app?","confirm.reset.b":"All data on this device will be deleted and the initial sample data restored. We recommend exporting a backup first.",
      "confirm.reset.y":"Yes, reset",
      "confirm.import.t":"Import backup?","confirm.import.b":"Your current data will be fully replaced by the file's data. Continue?",
      "confirm.import.y":"Yes, import",
      "insight.deficit":"This month's commitments exceed your salary by about {amt}. Your balance covers the gap, and in August the Ounass installment and nursery end — freeing {freed} monthly and turning this into a surplus.",
      "insight.surplus":"You have a monthly surplus of about {amt}. Directing part of it to the Japan trip keeps you on track before November.",
      "money.tab.accounts":"Accounts","money.tab.tx":"Transactions","money.tab.cats":"Categories",
      "acc.total":"Total net balance","acc.add":"Add account","acc.none":"No active accounts",
      "acc.archived":"Archived","acc.excluded":"excluded from net","acc.history":"Recent activity",
      "acc.type.bank":"Bank account","acc.type.savings":"Savings","acc.type.cash":"Cash","acc.type.card":"Credit card","acc.type.wallet":"Digital wallet",
      "acc.form.add":"New account","acc.form.edit":"Edit account","acc.name":"Account name","acc.type":"Type",
      "acc.balance":"Current balance","acc.bank":"Bank name (optional)","acc.includeNet":"Count in net balance",
      "acc.cantDelete":"Account has transactions — archive it instead","acc.cantDeleteLast":"At least one account must remain",
      "acc.transfer":"Transfer",
      "common.notes":"Notes (optional)","common.edit":"Edit","common.delete":"Delete",
      "common.archive":"Archive","common.unarchive":"Unarchive","common.duplicate":"Duplicate",
      "common.err.required":"This field is required","common.err.amount":"Enter a valid amount above zero",
      "common.err.date":"Enter a valid date","common.all":"All",
      "tx.new.expense":"New expense","tx.new.income":"New income","tx.edit":"Edit transaction",
      "tx.kind.expense":"Expense","tx.kind.income":"Income",
      "tx.name":"Name","tx.amount":"Amount","tx.date":"Date","tx.account":"Account","tx.category":"Category",
      "tx.uncat":"Uncategorized","tx.fixed":"Fixed","tx.variable":"Variable","tx.essential":"Essential",
      "tx.paid":"Paid","tx.pending":"Pending","tx.recurring":"Recurrence","tx.status":"Status",
      "tx.rec.none":"One-time","tx.rec.weekly":"Weekly","tx.rec.monthly":"Monthly","tx.rec.yearly":"Yearly",
      "tx.markPaid":"Mark as paid","tx.markPending":"Mark as pending",
      "tx.details":"Transaction details","tx.dupDone":"Duplicate created ✓",
      "tx.empty.t":"No transactions yet","tx.empty.p":"Log your first expense or income from the (+) button",
      "tx.filtered.t":"No matching results","tx.filtered.p":"Try adjusting your search or filters","flt.clear":"Clear filters",
      "tr.title":"Transfer between accounts","tr.from":"From account","tr.to":"To account","tr.err.same":"Choose two different accounts",
      "tr.name":"Transfer","tr.needTwo":"Add a second account first to make transfers",
      "tr.meta":"{from} → {to}",
      "flt.search":"Search name, notes, or amount…","flt.kind":"Type","flt.status":"Status",
      "cat.add":"Add category","cat.expense":"Expenses","cat.income":"Income","cat.subs":"sub",
      "cat.form.add":"New category","cat.form.edit":"Edit category","cat.icon":"Icon","cat.parent":"Parent category",
      "cat.parent.none":"None (top-level)","cat.hasChildren":"Delete its subcategories first",
      "cat.inUse.t":"Category in use","cat.inUse.b":"Some transactions use this category. Deleting it leaves them uncategorized. Continue?",
      "confirm.del.t":"Confirm deletion","confirm.del.b":"This action cannot be undone. Delete?","confirm.del.y":"Yes, delete",
      "dash.income":"Income this month","dash.expense":"Expenses this month","dash.pending":"Pending:",
      "dash.since":"since {d}","dash.recent":"Recent transactions","dash.viewAll":"View all",
      "quick.expense.t":"New expense","quick.expense.s":"Log an expense from any account",
      "quick.income.t":"New income","quick.income.s":"Salary, bonus, refund…",
      "quick.transfer.t":"Transfer between accounts","quick.transfer.s":"Never counted as income or expense",
      "plan.tab.all":"All","plan.tab.bills":"Bills","plan.tab.loans":"Loans & installments",
      "cm.summary":"Group monthly total","cm.paidOf":"{p} of {t} paid this month",
      "cm.add":"Add commitment","cm.form.add":"New commitment","cm.form.edit":"Edit commitment",
      "cm.kind.bill":"Fixed bill","cm.kind.loan":"Loan","cm.kind.installment":"Installment",
      "cm.provider":"Provider (optional)","cm.monthly":"Recurring payment","cm.original":"Original amount (optional)",
      "cm.count":"Number of payments (optional)","cm.dueDay":"Due day","cm.freq":"Payment frequency",
      "cm.freq.monthly":"Monthly","cm.freq.quarterly":"Quarterly","cm.freq.yearly":"Yearly",
      "cm.start":"Start date (optional)","cm.end":"End date (optional)",
      "cm.priority":"Priority","cm.pr.high":"High","cm.pr.normal":"Normal","cm.pr.low":"Low",
      "cm.err.day":"Between 1 and 31","cm.err.endBeforeStart":"End date is before start date",
      "cm.payNow":"Record payment","cm.paid":"Paid ✓","cm.overdue":"Overdue",
      "cm.inDays":"in {n} days","cm.upcoming":"Upcoming payments","cm.manage":"Manage",
      "cm.undo":"Undo payment","cm.pause":"Pause","cm.resume":"Resume",
      "cm.settle":"Early settlement","cm.settle.hint":"Records one payment and closes the commitment for good.",
      "cm.unsettle":"Undo early settlement",
      "cm.remainBal":"Remaining balance","cm.remainPay":"Payments left","cm.nextPay":"Next payment",
      "cm.endsOn":"Ends on","cm.endsIn":"Ends in {n} days","cm.freesAfter":"Freed after completion",
      "cm.history":"Payment history","cm.noHistory":"No payments recorded yet",
      "cm.completed":"Completed","cm.pausedChip":"Paused","cm.archivedChip":"Archived","cm.endedChip":"Ended",
      "cm.dupPay":"Already paid for this period — undo it first",
      "cm.done":"🎉 Commitment completed","cm.paySaved":"Payment recorded ✓","cm.undone":"Undone ✓",
      "cm.editPay":"Edit payment","cm.delPay.b":"The payment and its transaction will be removed and the amount returned to the account. Continue?",
      "cm.del.b":"Deleting the commitment keeps its past payments in the transactions ledger. Sure?",
      "cm.release":"Monthly cash flow improvement","cm.release.s":"What frees up as each commitment ends",
      "cm.cum":"Total freed",
      "cm.st.active":"Active","cm.st.paused":"Paused","cm.st.completed":"Completed","cm.st.archived":"Archived",
      "cm.sort.due":"Due day","cm.sort.amount":"Amount","cm.sort.end":"End date","cm.sort.name":"Name",
      "cm.account":"Payment account","cm.none.t":"No matching commitments","cm.none.p":"Adjust the filters, or add a new commitment",
      "cm.payDate":"Payment date","cm.payment":"Payment",
      "plan.sec.cm":"Commitments","plan.sec.family":"Family",
      "fam.title":"Family dashboard","fam.staff":"Household staff","fam.children":"Children",
      "fam.staffMonthly":"Staff / month","fam.kidsMonthly":"Children / month","fam.total":"Monthly total",
      "wk.add":"Add worker","wk.form.add":"New worker","wk.form.edit":"Edit worker",
      "wk.role":"Type","wk.role.temp":"Temporary","wk.role.permanent":"Permanent (recruited)","wk.role.other":"Other",
      "wk.salary":"Monthly salary","wk.discount":"Discount % (optional)","wk.net":"Net / month",
      "wk.window":"Arrival window","wk.startsIn":"Starts in {n} days","wk.started":"Started {d}",
      "wk.activate":"Activate & start salary","wk.activate.hint":"Creates a monthly commitment in her name, included in your totals and dashboard.",
      "wk.startDate":"Start date","wk.payDay":"Salary day","wk.cmName":"Salary — {n}",
      "wk.paySalary":"Record salary","wk.end":"End employment",
      "wk.end.b":"The salary commitment will be closed and leave your totals; past payments stay in the ledger. Continue?",
      "wk.st.expected":"Expected","wk.st.active":"Active","wk.st.ended":"Ended",
      "wk.del.b":"Deleting the worker deletes her salary commitment; its past payments stay in the ledger. Sure?",
      "sc.title":"Staffing scenarios","sc.s":"Monthly estimate — the handover month counts both workers (conservative), and the temp leaves when the permanent arrives.",
      "sc.a":"Early arrival ({d})","sc.b":"Late arrival ({d})","sc.total":"Total","sc.diff":"Difference",
      "ch.add":"Add child","ch.form.add":"New child profile","ch.form.edit":"Edit child profile",
      "ch.emoji":"Emoji","ch.monthly":"Monthly","ch.items":"Linked items",
      "ch.noItems":"No linked items yet — attach a commitment below",
      "ch.attach":"Attach commitment","ch.attach.pick":"Pick a commitment","ch.detach":"Detach",
      "ch.noneToAttach":"All active commitments are linked, or none exist",
      "ch.del.b":"Deleting the profile detaches its items without deleting them. Sure?",
      "plan.sec.travel":"Trips",
      "trip.add":"Add trip","trip.form.add":"New trip","trip.form.edit":"Edit trip",
      "trip.dest":"Destination","trip.start":"Departure date","trip.end":"Return date",
      "trip.target":"Target budget","trip.saved":"Saved for it","trip.status":"Status",
      "trip.st.planning":"Planning","trip.st.booked":"Booked","trip.st.active":"Ongoing","trip.st.done":"Done",
      "trip.travelers":"Travelers (comma separated)","trip.travelersT":"Travelers",
      "trip.back":"→ Trips","trip.daysTo":"days until departure","trip.nights":"{n} nights · {d} days",
      "trip.budget":"Trip budget","trip.planned":"Planned","trip.paidT":"Paid","trip.remaining":"Budget remaining",
      "trip.overPlan":"Planned exceeds the budget by {amt}","trip.paidOfTarget":"Paid {p} of {t}",
      "trip.readiness":"Readiness","trip.readiness.s":"Booked {b}/{i} · Paid {p}/{i} · Checklist {c}/{ct}",
      "trip.daily":"Daily budget","trip.daily.s":"Spending allowance during the trip","trip.daily.total":"Total for {d} days",
      "trip.daily.hint":"Suggestion: {amt}/day from what remains after planned items",
      "trip.items":"Trip items","trip.item.add":"Add item","trip.item.form.add":"New item","trip.item.form.edit":"Edit item",
      "trip.item.planned":"Planned amount","trip.item.due":"Due date (optional)","trip.item.ref":"Booking ref (optional)",
      "trip.item.booked":"Booked","trip.item.notBooked":"Not booked",
      "trip.cat.flights":"Flights","trip.cat.hotel":"Hotel","trip.cat.visa":"Visas","trip.cat.tickets":"Tickets & events",
      "trip.cat.transport":"Transport","trip.cat.food":"Food","trip.cat.shopping":"Shopping","trip.cat.other":"Other",
      "trip.pay":"Record payment","trip.unpay":"Undo payment","trip.paidChip":"Paid ✓","trip.bookedChip":"Booked",
      "trip.unpay.b":"The payment transaction will be removed and the amount returned to the account. Continue?",
      "trip.item.del.b":"Deleting the item keeps its payment transaction in the ledger, if any. Sure?",
      "trip.checklist":"Readiness checklist","trip.cl.add":"Add a task…",
      "trip.del.b":"Deleting the trip removes its items and checklist; payment transactions stay in the ledger. Sure?",
      "trip.none.t":"No trips yet","trip.none.p":"Add your first trip below",
      "plan.sec.planner":"Monthly",
      "pl.dashTitle":"{m} plan","pl.surplus":"Planned surplus","pl.deficit":"Planned deficit",
      "pl.plannedIn":"Planned income","pl.plannedOut":"Planned spending","pl.alerts":"Alerts",
      "pl.month":"Month planner","pl.net":"Planned net",
      "pl.actual":"Actual so far","pl.actualIn":"Actual income","pl.actualOut":"Actual spending",
      "pl.timeline":"Financial calendar","pl.timeline.s":"Every expected payment in day order — salary cycle on day {d}",
      "pl.salary":"Monthly salary","pl.expectedChip":"Expected","pl.day":"Day",
      "pl.extra.add":"Add planned item","pl.extra.form.add":"New planned item","pl.extra.form.edit":"Edit planned item",
      "pl.extra.hint":"A planning-only item — it never touches balances until you record it as a transaction.",
      "pl.extra.record":"Record as transaction","pl.extra.undo":"Undo recording",
      "pl.extra.undo.b":"The transaction will be removed and its effect reversed. Continue?",
      "pl.extra.del.b":"Deleting the planned item never touches any previously recorded transaction. Sure?",
      "pl.alerts.t":"This month's alerts","pl.al.deficit":"The plan runs a {amt} deficit this month",
      "pl.al.overdue":"{n} overdue payments need recording","pl.al.trip":"{n} trip items due this month",
      "pl.al.frees":"{name} ends this month — {amt}/month frees up after it",
      "pl.forecast":"12-month forecast","pl.forecast.s":"The cumulative balance starts from your current balance; month one counts only what remains.",
      "pl.sc.best":"Best case","pl.sc.expected":"Expected","pl.sc.worst":"Worst case",
      "pl.sc.hint":"Salary and commitments are identical in every scenario; only flexible spending (85%/115%) and the staffing arrival month (cheapest/priciest) move.",
      "pl.col.in":"In","pl.col.out":"Out","pl.col.net":"Net","pl.col.cum":"Balance",
      "pl.whatif":"What if?","pl.wf.flex":"Extra flexible spending / month","pl.wf.salary":"Salary change (+/−)",
      "pl.wf.staff":"Permanent-worker arrival","pl.wf.a":"Early","pl.wf.b":"Late",
      "plan.sec.advisor":"Advisor",
      "adv.title":"Financial advisor","adv.sub":"Analysis built only from your actual data and numbers",
      "adv.src.actual":"Actual","adv.src.planned":"Planned","adv.src.forecast":"Forecast","adv.src.scenario":"Scenario",
      "adv.p1":"Urgent","adv.p2":"Important","adv.p3":"Opportunities & info",
      "adv.dismiss":"Dismiss","adv.showHidden":"Show hidden ({n})","adv.noInsights":"Nothing to flag right now — you're steady 🌿",
      "adv.go":"Open",
      "adv.score.t":"Health score explained","adv.score.load":"Commitment load: {out} of {sal} salary ({pct}%) → {pts}/55 pts",
      "adv.score.buffer":"Buffer: your {bal} covers {m} months of commitments → {pts}/35 pts",
      "adv.score.bonus":"Near-relief bonus: your current deficit flips as nearby installments end → +{pts}/10",
      "adv.score.nobonus":"Near-relief bonus: not active right now (0/10)",
      "adv.i.overdue.t":"{n} overdue payments totalling {amt}","adv.i.overdue.b":"Recording them keeps the month accurate and stops the backlog.",
      "adv.i.deficit.t":"This month's plan runs a {amt} deficit","adv.i.deficit.b":"Planned income {inc} vs planned spending {out}. It's temporary — it shrinks as installments end.",
      "adv.i.lowpoint.t":"Projected balance bottoms out in {m}: {amt}","adv.i.lowpoint.b":"Under the \"expected\" scenario (includes unpaid trip items). Spreading or advancing trip payments smooths the curve.",
      "adv.i.negative.t":"Warning: projected balance goes negative in {m} ({amt})","adv.i.negative.b":"Per the {months}-month expected forecast. Biggest driver: {reason} payments.",
      "adv.i.release.t":"{amt}/month frees up after {m}","adv.i.release.b":"As {name} ends. Total freed by {lastM}: {cum}/month — a great base for an automatic savings rule.",
      "adv.i.discount.t":"Temp worker discount not applied","adv.i.discount.b":"If the 20% discount on {sal} is confirmed: {save}/month saved. Update it from Family → Edit.",
      "adv.i.staffdiff.t":"Arrival scenarios differ by {amt}","adv.i.staffdiff.b":"Early arrival costs {a}, late {b} over 6 months. For planning only.",
      "adv.i.trip.t":"Unpaid trip items: {amt}","adv.i.trip.b":"Projected balance before {m}: {cum}. {verdict}",
      "adv.i.trip.short":"Short of what's needed — paying some items in surplus months helps.","adv.i.trip.okv":"Covers it under the current forecast.",
      "adv.i.settle.t":"Closest installment to finishing: {name}","adv.i.settle.b":"{amt} left over {n} payments, ending {m}. Early settlement is an option if you want fewer commitments — your call.",
      "adv.i.surplus.t":"{n} surplus months ahead","adv.i.surplus.b":"Best is {m} at {amt}. Scheduling savings transfers in those months builds the buffer painlessly.",
      "adv.an.spend":"Spending analysis","adv.an.spend.total":"{m} actual spending: {amt} ({pct}% of the {plan} plan)",
      "adv.an.spend.none":"No expenses recorded this month yet",
      "adv.an.cash":"Cash-flow analysis","adv.an.cash.b":"Lowest projected balance: {min} in {minM} · Highest: {max} in {maxM} · Surplus months: {n}/12",
      "adv.an.cm":"Commitment analysis","adv.an.cm.b":"{n} active commitments totalling {amt}/month ({pct}% of salary) · {freed}/month frees up by {m}",
      "adv.an.fam":"Family cost","adv.an.fam.b":"Staff (planned): {staff} · Children items: {kids} · Total {tot} ({pct}% of salary)",
      "adv.an.trip":"Trip budget","adv.an.trip.b":"Target {t} · Planned {p} · Paid {paid} · Unpaid {un} · Readiness {r}%",
      "adv.ask":"Ask about your numbers","adv.ask.ph":"e.g. When does the Ounass installment end?",
      "adv.ask.btn":"Ask","adv.ask.hint":"I answer only from your locally stored data — no invented numbers.",
      "adv.ask.fallback":"I couldn't understand that. Try one of these:",
      "adv.ex.1":"What's my balance?","adv.ex.2":"When does the Ounass installment end?","adv.ex.3":"How is the Japan trip?","adv.ex.4":"When do things improve?",
      "adv.a.balance":"Your current net balance is {bal} (actual) across {n} accounts. Monthly commitments: {out}.",
      "adv.a.cm":"You have {n} active commitments totalling {amt}/month. Nearest to end: {name} in {m} — {freed}/month frees up after it.",
      "adv.a.cmOne":"{name}: {amt}/month, {rem} remaining{end}. {paid}",
      "adv.a.cmOne.end":" and it ends in {m}","adv.a.cmOne.paid":"This month's payment is recorded ✓ (actual).","adv.a.cmOne.unpaid":"This month's payment isn't recorded yet.",
      "adv.a.trip":"{name}: {days} days away. Target {t}, paid {paid} (actual), unpaid {un} (planned), readiness {r}%.",
      "adv.a.staff":"Staff: {rows}. Arrival scenarios differ by {diff} over 6 months (scenario).",
      "adv.a.forecast":"This month's planned net is {net} (planned). Lowest projected balance in 12 months: {min} in {m} (forecast).",
      "adv.a.save":"Nearest improvement: {m}, {amt}/month frees up. Total freed by the horizon: {cum}/month (forecast). Surplus months ahead: {n}.",
      "adv.a.score":"Your score is {score}/100. Details in the explanation card above.",
      "adv.a.salary":"Your salary is {sal} on day {d}. {got}",
      "adv.a.salary.got":"This month's salary is received ✓ (actual).","adv.a.salary.no":"This month's salary isn't recorded yet.",
      "cl.title":"Account & sync","cl.notCfg.t":"Cloud not configured",
      "cl.notCfg.b":"The app runs fully local. To enable sync: create a Supabase project, run the bundled SQL files, and put your project URL and publishable key in js/config.js — full steps in the README.",
      "cl.st.local":"Local only","cl.st.signedout":"Signed out","cl.st.pending":"Awaiting first migration",
      "cl.st.offline":"Offline","cl.st.syncing":"Syncing…","cl.st.synced":"Synced ✓",
      "cl.st.error":"Sync error","cl.st.conflict":"Conflict needs your decision",
      "cl.lastSync":"Last synced: {t}","cl.never":"never","cl.syncNow":"Sync now",
      "cl.signIn":"Sign in","cl.signUp":"Create account","cl.signOut":"Sign out",
      "cl.reset":"Forgot password","cl.email":"Email","cl.pass":"Password",
      "cl.auth.t":"Sign in to sync","cl.auth.hint":"Your data stays isolated to your account via RLS policies — nobody else can read it.",
      "cl.resetSent":"Reset link sent to your email ✓","cl.signedUp":"Account created — check your email if confirmation is required",
      "cl.err.invalid":"Invalid credentials","cl.err.exists":"Email already registered",
      "cl.err.net":"Connection failed — check your network","cl.err.generic":"Something went wrong",
      "cl.err.empty":"Enter email and password",
      "cl.mig.t":"Upload your current data to the cloud?","cl.mig.b":"First sign-in for this account. Your full local copy will be uploaded once, with a local backup kept beforehand and totals validated afterwards.",
      "cl.mig.y":"Upload my data","cl.mig.pendingBtn":"Start first migration",
      "cl.mig.ok":"Migrated and validated ✓","cl.mig.fail":"Validation failed — rolled back; your local data is intact",
      "cl.conf.t":"Two versions in conflict","cl.conf.b":"The cloud has a newer copy and you have unsynced local edits. Pick one — the other is kept as a local backup.",
      "cl.conf.cloud":"Use the cloud copy (newer)","cl.conf.local":"Upload my local copy",
      "cl.backupCloud":"Cloud backup now","cl.backupCloud.ok":"Cloud backup saved ✓",
      "cl.updateReady":"Update ready — close and reopen the app",
      "cl.applied.cloud":"Cloud copy applied ✓","cl.applied.local":"Local copy uploaded ✓",
      "rep.title":"Reports center","rep.month":"Monthly report","rep.year":"{y} summary",
      "rep.in":"Income","rep.out":"Spending","rep.net":"Net","rep.txCount":"{n} transactions",
      "rep.cats":"By category","rep.cm":"Commitments","rep.cm.b":"{n} active · {amt}/month · paid this month: {paid}",
      "rep.fam":"Family","rep.fam.b":"Staff payments (year): {staff} · Children items/month: {kids}",
      "rep.trip":"Trip","rep.trip.b":"{name}: paid {paid} of {t} · readiness {r}%",
      "rep.csv":"Export CSV","rep.print":"Print / PDF","rep.print.hint":"For PDF: choose \"Save as PDF\" in the print dialog — the most reliable browser path.",
      "rep.empty":"No transactions in this period",
      "month.long":["January","February","March","April","May","June","July","August","September","October","November","December"],
      "version":"Version {v} · Final release · schema v8"
    }
  };
  let lang = "ar";
  const t = (key, vars) => {
    let s = (dict[lang] && dict[lang][key]) ?? dict.ar[key] ?? key;
    if (vars && typeof s === "string")
      for (const k in vars) s = s.replaceAll("{"+k+"}", vars[k]);
    return s;
  };
  const setLang = (l) => {
    lang = (l === "en") ? "en" : "ar";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    document.title = lang === "ar" ? "مالية | Maliya" : "Maliya | مالية";
  };
  return { t, setLang, get lang(){ return lang; } };
})();

/* ============================================================
   MODULE: STORE — state, persistence, versioning, migration
   ============================================================ */
const Store = (() => {
  const KEY = "maliya.data.v1";
  const SCHEMA_VERSION = 8;
  const APP_VERSION = "2.0.0";
  const uid = (p) => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* Default category tree — fully editable by the user. */
  const defaultCategories = () => {
    const mk = (id, name, icon, type, order) =>
      ({ id, name, icon, type, parentId: null, order, archived: false });
    return [
      mk("cat_loans","القروض","🏦","expense",1),
      mk("cat_installments","الأقساط","📦","expense",2),
      mk("cat_phone","الجوال","📱","expense",3),
      mk("cat_internet","الإنترنت","🌐","expense",4),
      mk("cat_nursery","الحضانة","🧸","expense",5),
      mk("cat_children","الأطفال","🧒","expense",6),
      mk("cat_staff","العمالة المنزلية","🏠","expense",7),
      mk("cat_food","الغذاء","🛒","expense",8),
      mk("cat_restaurants","المطاعم","🍽️","expense",9),
      mk("cat_coffee","القهوة","☕","expense",10),
      mk("cat_shopping","التسوق","🛍️","expense",11),
      mk("cat_transport","المواصلات","🚗","expense",12),
      mk("cat_medical","الصحة","🩺","expense",13),
      mk("cat_education","التعليم","🎓","expense",14),
      mk("cat_fun","الترفيه","🎡","expense",15),
      mk("cat_family","العائلة","👨‍👩‍👧‍👦","expense",16),
      mk("cat_subs","الاشتراكات","🔁","expense",17),
      mk("cat_travel","السفر","✈️","expense",18),
      mk("cat_emergency","الطوارئ","🚨","expense",19),
      mk("cat_other","أخرى","📌","expense",20),
      mk("cat_salary","الراتب","💼","income",1),
      mk("cat_bonus","مكافأة","🎁","income",2),
      mk("cat_refund","استرداد","↩️","income",3),
      mk("cat_gift","هدية","🎀","income",4),
      mk("cat_freelance","عمل حر","🧑‍💻","income",5),
      mk("cat_income_other","دخل آخر","➕","income",6)
    ];
  };

  const cmSeed = (name, kind, provider, type, category, amount, dueDay, endDate, childId = null) => ({
    id: uid("cm"), name, kind, provider, type, category, amount, childId,
    originalAmount: null, installmentsTotal: null, dueDay,
    frequency: "monthly", startDate: null, endDate,
    accountId: "acc_main", priority: "normal", status: "active",
    autoRecur: true, notes: "", payments: [], settledEarly: null
  });

  const tiSeed = (id, name, category, planned) => ({ id, name, category, planned,
    paid: false, paidAmount: 0, txId: null, dueDate: null, booked: false, ref: "", notes: "" });
  const clSeed = (id, text) => ({ id, text, done: false });
  const japanSampleItems = () => [
    tiSeed("ti_hotel", "فندق طوكيو (٧ ليالٍ)", "hotel", 12000),
    tiSeed("ti_visa", "تأشيرات اليابان (٤ مسافرين)", "visa", 1500),
    tiSeed("ti_disney", "تذاكر ديزني لاند", "tickets", 1200),
    tiSeed("ti_premier", "Premier Access", "tickets", 600),
    tiSeed("ti_dfood", "مأكولات ديزني", "food", 1500)
  ];
  const japanSampleChecklist = () => [
    clSeed("cl_pass", "جوازات سارية المفعول"),
    clSeed("cl_visa", "إصدار التأشيرات"),
    clSeed("cl_hotel", "تأكيد حجز الفندق"),
    clSeed("cl_tix", "شراء تذاكر ديزني"),
    clSeed("cl_cash", "عملة يابانية وبطاقات"),
    clSeed("cl_sim", "شرائح اتصال / eSIM")
  ];

  /* Initial sample data — everything here is user-editable in later phases. */
  const sampleSeed = () => ({
    meta: {
      schemaVersion: SCHEMA_VERSION,
      appVersion: APP_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    settings: {
      lang: "ar", theme: "system", accent: "emerald",
      currency: "SAR", numerals: "latn", dateFmt: "dmy",
      salaryDay: 27, monthStart: 1, defaultAccountId: "acc_main",
      monthlySalary: 9904.86
    },
    accounts: [
      { id: "acc_main", name: "الحساب الرئيسي", type: "bank", balance: 14100,
        currency: "SAR", bank: "", includeInNet: true, archived: false, notes: "" }
    ],
    /* type: fixed | temporary | child — endDate null = ongoing
       kind: bill | loan | installment — drives the commitments UI */
    commitments: [
      cmSeed("قرض الأهلي SNB","loan","SNB","fixed","cat_loans",1498.96,27,null),
      cmSeed("قرض إمكان","loan","إمكان","fixed","cat_loans",443.59,27,null),
      cmSeed("فاتورة الجوال STC","bill","STC","fixed","cat_phone",432.20,27,null),
      cmSeed("الإنترنت المنزلي","bill","","fixed","cat_internet",440.83,27,null),
      cmSeed("قسط أوناس","installment","أوناس","temporary","cat_installments",2207,27,"2026-08-31"),
      cmSeed("قسط الطيران","installment","","temporary","cat_installments",914.86,27,"2026-09-30"),
      cmSeed("قسط مهارة الأول","installment","مهارة","temporary","cat_installments",843.52,27,"2026-10-31"),
      cmSeed("قسط مهارة الثاني","installment","مهارة","temporary","cat_installments",836.02,27,"2027-02-28"),
      cmSeed("حضانة منصور","bill","","child","cat_nursery",2932.50,1,"2026-08-04","ch_mansour")
    ],
    children: [
      { id: "ch_mansour", name: "منصور", emoji: "👦", notes: "" },
      { id: "ch_rima", name: "ريما", emoji: "👧", notes: "" }
    ],
    /* Monthly planner (Phase 6) — extras + what-if settings */
    planner: { extras: [], whatif: { spendingFlex: 0, salaryDelta: 0, staffScenario: "a" } },
    /* Advisor (Phase 7) — everything is derived; only dismissals are stored */
    advisor: { dismissed: [] },
    /* Household staff (Phase 4) — sample data, fully editable */
    household: {
      workers: [
        { id: "wk_temp", name: "العاملة المؤقتة", role: "temp", salary: 3542,
          discountPct: 0, startDate: null, endDate: null,
          expectedFrom: "2026-07-22", expectedTo: null, status: "expected",
          notes: "احتمال خصم 20٪", commitmentId: null },
        { id: "wk_perm", name: "العاملة الدائمة", role: "permanent", salary: 1500,
          discountPct: 0, startDate: null, endDate: null,
          expectedFrom: "2026-08-17", expectedTo: "2026-09-16", status: "expected",
          notes: "قُدّم الطلب 8 يوليو 2026", commitmentId: null }
      ]
    },
    categories: defaultCategories(),
    transactions: [],
    trips: [
      { id: "trip_japan", name: "رحلة اليابان", destination: "طوكيو، اليابان",
        startDate: "2026-11-17", endDate: "2026-11-24",
        travelers: ["أنا", "زوجي", "منصور", "ريما"],
        targetBudget: 16800, savedAmount: 0, status: "planning", currency: "SAR", notes: "",
        items: japanSampleItems(), checklist: japanSampleChecklist(), dailyBudget: null }
    ]
  });

  let state = null;
  const listeners = [];

  const migrate = (data) => {
    /* Future phases raise SCHEMA_VERSION and add upgrade steps here.
       Each step transforms data from version N to N+1 without losing anything. */
    if (!data.meta) data.meta = { schemaVersion: 0 };
    switch (data.meta.schemaVersion) {
      case 0:
      case 1:
        /* v1 → v2: money-module structures */
        if (!Array.isArray(data.categories)) data.categories = defaultCategories();
        if (!Array.isArray(data.transactions)) data.transactions = [];
        /* falls through */
      case 2:
        /* v2 → v3: commitment payment ledger — new fields are added by the
           normalization layer below; category slugs become category ids. */
        /* falls through */
      case 3:
        /* v3 → v4: household staff + child links — all new structures are
           filled with safe defaults by the normalization layer below. */
        /* falls through */
      case 4:
        /* v4 → v5: travel planner — trips gain items/checklist/dailyBudget via
           the normalization layer; the known sample trip gets its sample data. */
        /* falls through */
      case 5:
        /* v5 → v6: monthly planner — planner extras & what-if settings are
           added with safe defaults by the normalization layer below. */
        /* falls through */
      case 6:
        /* v6 → v7: advisor — insights are fully derived from data, so the only
           stored structure is the dismissed-insights list (normalized below). */
        /* falls through */
      case 7:
        /* v7 → v8: production/cloud — no structural change to financial data.
           meta.updatedAt is guaranteed below; sync bookkeeping lives OUTSIDE
           the state document (maliya.sync.v1) so it never syncs itself. */
        /* falls through */
      default: break;
    }
    /* Safe defaults for missing or optional fields, whatever the backup's age.
       Object.assign keeps every existing value and only fills the gaps. */
    data.settings = Object.assign({ lang:"ar", theme:"system", accent:"emerald",
      currency:"SAR", numerals:"latn", dateFmt:"dmy", salaryDay:27, monthStart:1,
      defaultAccountId:null, monthlySalary:0 }, data.settings);
    data.accounts = (data.accounts || []).map(a => Object.assign({ id: uid("acc"),
      name:"", type:"bank", balance:0, currency:data.settings.currency, bank:"",
      includeInNet:true, archived:false, notes:"" }, a));
    data.commitments = (data.commitments || []).map(c => {
      const m = Object.assign({ id: uid("cm"), name:"", type:"fixed", kind:null,
        provider:"", category:null, amount:0, originalAmount:null,
        installmentsTotal:null, dueDay:27, frequency:"monthly", startDate:null,
        endDate:null, accountId:(data.settings.defaultAccountId || null),
        priority:"normal", status:"active", autoRecur:true, notes:"",
        payments:[], settledEarly:null, childId:null }, c);
      if (!m.kind) m.kind = m.category === "loans" ? "loan"
        : (m.type === "temporary" ? "installment" : "bill");
      if (!Array.isArray(m.payments)) m.payments = [];
      /* pre-v3 commitments stored category slugs; map to category ids */
      if (m.category && !String(m.category).startsWith("cat_")) {
        const hit = (data.categories || []).some(v => v.id === "cat_" + m.category);
        m.category = hit ? "cat_" + m.category : null;
      }
      return m;
    });
    data.transactions = (data.transactions || []).map(x => Object.assign({ id: uid("tx"),
      kind:"expense", name:"", amount:0, date:null, accountId:null, toAccountId:null,
      categoryId:null, fixedVar:"variable", essential:false, status:"paid",
      recurring:"none", notes:"", createdAt:"", commitmentId:null, tripItemId:null, plannerId:null }, x));
    const adv = data.advisor || {};
    data.advisor = { dismissed: Array.isArray(adv.dismissed) ? adv.dismissed.filter(x => typeof x === "string") : [] };
    const pl = data.planner || {};
    data.planner = {
      extras: (pl.extras || []).map(ex => Object.assign({ id: uid("ex"), ym: "",
        name: "", kind: "expense", amount: 0, day: 1, done: false, txId: null }, ex)),
      whatif: Object.assign({ spendingFlex: 0, salaryDelta: 0, staffScenario: "a" }, pl.whatif || {})
    };
    data.categories = data.categories || [];
    data.children = (data.children || []).map(c => Object.assign({ id: uid("ch"),
      name:"", emoji:"🧒", notes:"" }, c));
    const hh = data.household || {};
    data.household = { workers: (hh.workers || []).map(w => Object.assign({ id: uid("wk"),
      name:"", role:"temp", salary:0, discountPct:0, startDate:null, endDate:null,
      expectedFrom:null, expectedTo:null, status:"expected", notes:"",
      commitmentId:null }, w)) };
    data.trips = (data.trips || []).map(tp => {
      const m = Object.assign({ id: uid("trip"), name:"", destination:"", startDate:null,
        endDate:null, travelers:[], targetBudget:0, savedAmount:0, status:"planning",
        currency:(data.settings.currency || "SAR"), notes:"", items:null, checklist:null,
        dailyBudget:null }, tp);
      if (!Array.isArray(m.items))
        m.items = m.id === "trip_japan" ? japanSampleItems() : [];
      if (!Array.isArray(m.checklist))
        m.checklist = m.id === "trip_japan" ? japanSampleChecklist() : [];
      m.items = m.items.map(i => Object.assign({ id: uid("ti"), name:"", category:"other",
        planned:0, paid:false, paidAmount:0, txId:null, dueDate:null, booked:false,
        ref:"", notes:"" }, i));
      m.checklist = m.checklist.map(x => Object.assign({ id: uid("cl"), text:"", done:false }, x));
      if (!Array.isArray(m.travelers)) m.travelers = [];
      return m;
    });
    if (!data.settings.defaultAccountId && data.accounts[0])
      data.settings.defaultAccountId = data.accounts[0].id;
    if (!data.meta.updatedAt) data.meta.updatedAt = new Date().toISOString();
    data.meta.schemaVersion = SCHEMA_VERSION;
    data.meta.appVersion = APP_VERSION;
    return data;
  };
const emptySeed = () => migrate({
  meta: {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  settings: {
    lang: "ar",
    theme: "system",
    accent: "emerald",
    currency: "SAR",
    numerals: "latn",
    dateFmt: "dmy",
    salaryDay: 27,
    monthStart: 1,
    defaultAccountId: "",
    monthlySalary: 0
  },
  accounts: [],
  commitments: [],
  children: [],
  household: {
    workers: []
  },
  categories: defaultCategories(),
  transactions: [],
  trips: []
});
  const load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) { state = emptySeed(); persist(); return; }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.settings) throw new Error("bad");
      const oldVersion = parsed.meta && parsed.meta.schemaVersion;
      state = migrate(parsed);
      if (oldVersion !== SCHEMA_VERSION) persist(); /* write upgraded schema back */
    } catch (e) {
      /* Corrupt storage: keep a rescue copy, then reseed. */
      try { localStorage.setItem(KEY + ".corrupt", localStorage.getItem(KEY) || ""); } catch (_) {}
      state = emptySeed(); persist();
    }
  };
  const persist = () => {
    state.meta.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
  };
  const save = () => { persist(); listeners.forEach(fn => fn(state));
    try { Cloud.onLocalSave(); } catch (e) { /* Cloud not ready yet */ } };
  const onChange = (fn) => listeners.push(fn);

  const validateImport = (data) => {
    if (!data || typeof data !== "object") return false;
    if (!data.settings || !Array.isArray(data.accounts) || !Array.isArray(data.commitments)) return false;
    return true;
  };
  const replaceAll = (data) => { state = migrate(data); save(); };
  const resetAll = () => { state = seed(); save(); };

  return {
    load, save, onChange, uid, validateImport, replaceAll, resetAll,
    get: () => state,
    get settings() { return state.settings; }
  };
})();

/* ============================================================
   MODULE: FMT — numbers, currency, dates (locale + numerals aware)
   ============================================================ */
const FMT = (() => {
  const locale = () => {
    const nu = Store.settings.numerals === "arab" ? "-u-nu-arab" : "-u-nu-latn";
    return (I18N.lang === "ar" ? "ar-SA" : "en-US") + nu;
  };
  const num = (v, dec = 2) => {
    const n = Number(v);
    if (!isFinite(n)) return "—";
    return new Intl.NumberFormat(locale(), {
      minimumFractionDigits: 0, maximumFractionDigits: dec
    }).format(n);
  };
  const money = (v, dec = 2) => {
    const n = Number(v);
    if (!isFinite(n)) return "—";
    const cur = Store.settings.currency === "SAR"
      ? (I18N.lang === "ar" ? "ر.س" : "SAR")
      : Store.settings.currency;
    return num(n, dec) + " " + cur;
  };
  const date = (iso) => {
    const d = iso instanceof Date ? iso : new Date(iso + "T00:00:00");
    if (isNaN(d)) return "—";
    const dd = num(d.getDate(), 0), mm = num(d.getMonth() + 1, 0), yy = num(d.getFullYear(), 0);
    return Store.settings.dateFmt === "mdy" ? `${mm}/${dd}/${yy}` : `${dd}/${mm}/${yy}`;
  };
  const monthName = (m) => I18N.t("month.long")[m];
  return { num, money, date, monthName };
})();

/* ============================================================
   MODULE: CALC — all financial formulas (pure, testable)
   ============================================================ */
const Calc = (() => {
  const safe = (n) => (isFinite(Number(n)) ? Number(n) : 0);
  const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const parseISO = (s) => { const d = new Date(s + "T00:00:00"); return isNaN(d) ? null : d; };
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);

  /* A commitment counts this month if active and its endDate hasn't passed
     before the start of the current calendar month. */
  const isActiveThisMonth = (c, ref = today()) => {
    if (c.status !== "active") return false;
    if (!c.endDate) return true;
    const end = parseISO(c.endDate);
    if (!end) return true;
    const monthStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
    return end >= monthStart;
  };

  const totals = (state) => {
    const active = state.commitments.filter(c => isActiveThisMonth(c));
    const sum = (type) => active.filter(c => c.type === type)
      .reduce((a, c) => a + safe(c.amount), 0);
    const fixed = sum("fixed"), temporary = sum("temporary"), child = sum("child");
    const outflow = fixed + temporary + child;
    const salary = safe(state.settings.monthlySalary);
    const remaining = salary - outflow;
    return { fixed, temporary, child, outflow, salary,
             remaining, surplus: remaining >= 0 ? remaining : 0,
             deficit: remaining < 0 ? -remaining : 0 };
  };

  const netBalance = (state) =>
    state.accounts.filter(a => a.includeInNet && !a.archived)
      .reduce((a, ac) => a + safe(ac.balance), 0);

  /* Commitments with an end date, soonest first, with the monthly amount freed. */
  const endingSoon = (state, withinDays = 240) => {
    const t0 = today();
    return state.commitments
      .filter(c => c.status === "active" && c.endDate)
      .map(c => {
        const end = parseISO(c.endDate);
        return { ...c, end, daysLeft: end ? daysBetween(t0, end) : null };
      })
      .filter(c => c.end && c.daysLeft >= -31 && c.daysLeft <= withinDays)
      .sort((a, b) => a.end - b.end);
  };

  const daysToTrip = (state) => {
    const trip = state.trips && state.trips[0];
    if (!trip) return null;
    const d = parseISO(trip.startDate);
    if (!d) return null;
    return { trip, days: daysBetween(today(), d) };
  };

  /* Financial health score v1 (0–100):
     - Commitment load  (55 pts): how far monthly outflow sits below income.
     - Balance buffer   (35 pts): months of outflow the balance covers (cap 3).
     - Near relief bonus(10 pts): commitments ending ≤ 75 days that would
       flip a deficit into surplus.
     Refined with real cash-flow history in Phase 7. */
  const healthScore = (state) => {
    const t = totals(state);
    const bal = netBalance(state);
    const loadPts = t.salary > 0
      ? Math.max(0, Math.min(1, 1 - t.outflow / t.salary)) * 55 : 0;
    const bufferPts = t.outflow > 0
      ? Math.min(bal / t.outflow, 3) / 3 * 35
      : (bal > 0 ? 35 : 0);
    let bonus = 0;
    if (t.remaining < 0) {
      const soonFreed = endingSoon(state, 75).reduce((a, c) => a + safe(c.amount), 0);
      if (t.remaining + soonFreed > 0) bonus = 10;
    }
    const score = Math.round(Math.max(0, Math.min(100, loadPts + bufferPts + bonus)));
    const band = score < 35 ? "low" : score < 55 ? "mid" : score < 75 ? "good" : "great";
    return { score, band };
  };

  /* Financial-month window based on settings.monthStart (1–28). */
  const monthRange = (settings, ref = today()) => {
    const day = Math.min(Math.max(1, Number(settings.monthStart) || 1), 28);
    let start = new Date(ref.getFullYear(), ref.getMonth(), day);
    if (ref < start) start = new Date(ref.getFullYear(), ref.getMonth() - 1, day);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, day);
    return { start, end };
  };

  /* Income/expense totals for the current financial month.
     Transfers are never counted. Pending expenses reported separately. */
  const monthStats = (state) => {
    const { start, end } = monthRange(state.settings);
    let income = 0, expense = 0, pendingExpense = 0;
    for (const tx of (state.transactions || [])) {
      const d = parseISO(tx.date);
      if (!d || d < start || d >= end) continue;
      if (tx.kind === "income" && tx.status === "paid") income += safe(tx.amount);
      else if (tx.kind === "expense") {
        if (tx.status === "paid") expense += safe(tx.amount);
        else pendingExpense += safe(tx.amount);
      }
    }
    return { income, expense, pendingExpense, start, end };
  };

  /* ---- commitment engine (Phase 3) ---- */
  const clampDay = (y, m, day) => Math.min(day, new Date(y, m + 1, 0).getDate());
  const dueDateOf = (ref, dueDay) =>
    new Date(ref.getFullYear(), ref.getMonth(), clampDay(ref.getFullYear(), ref.getMonth(), dueDay || 27));
  const periodKey = (d, freq) => {
    const y = d.getFullYear(), m = d.getMonth();
    if (freq === "yearly") return String(y);
    if (freq === "quarterly") return y + "-Q" + (Math.floor(m / 3) + 1);
    return y + "-" + String(m + 1).padStart(2, "0");
  };
  const addPeriod = (d, freq) => new Date(d.getFullYear(),
    d.getMonth() + (freq === "yearly" ? 12 : freq === "quarterly" ? 3 : 1), 1);
  const countPeriods = (a, b, freq) => {
    const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    const per = freq === "yearly" ? 12 : freq === "quarterly" ? 3 : 1;
    return Math.max(0, Math.floor(months / per) + 1);
  };

  /* All derived numbers for one commitment. Pure — safe to test. */
  const commitmentStats = (c, ref = today()) => {
    const freq = c.frequency || "monthly";
    const pays = (c.payments || []);
    const regular = pays.filter(p => !p.early);
    const curKey = periodKey(ref, freq);
    const paidThisPeriod = pays.some(p => p.period === curKey);
    const paidTotal = pays.reduce((a, p) => a + safe(p.amount), 0);
    const end = c.endDate ? parseISO(c.endDate) : null;
    const start = c.startDate ? parseISO(c.startDate) : null;
    const totalPayments = c.installmentsTotal
      || (start && end ? countPeriods(start, end, freq) : null);
    let remainingPayments = null;
    if (c.status === "completed") remainingPayments = 0;
    else if (c.installmentsTotal)
      remainingPayments = Math.max(0, c.installmentsTotal - regular.length);
    else if (end) {
      if (end < ref) remainingPayments = 0;
      else {
        /* Count periods between now and the end date that have no payment,
           so paying ahead correctly shrinks the remaining count. */
        const paidKeys = new Set(regular.map(p => p.period));
        let cursor = new Date(ref.getFullYear(), ref.getMonth(), 1), n = 0, guard = 0;
        while (cursor <= end && guard++ < 600) {
          if (!paidKeys.has(periodKey(cursor, freq))) n++;
          cursor = addPeriod(cursor, freq);
        }
        remainingPayments = n;
      }
    }
    const remainingBalance = c.status === "completed" ? 0
      : (c.originalAmount ? Math.max(0, safe(c.originalAmount) - paidTotal)
      : (remainingPayments !== null ? Math.round(remainingPayments * safe(c.amount) * 100) / 100 : null));
    let progress = 0;
    if (c.status === "completed") progress = 1;
    else if (totalPayments) progress = Math.min(1, regular.length / totalPayments);
    else if (c.originalAmount) progress = Math.min(1, paidTotal / safe(c.originalAmount));
    else if (start && end && end > start)
      progress = Math.max(0, Math.min(1, (ref - start) / (end - start)));
    else progress = paidThisPeriod ? 1 : 0;
    let next = null;
    if (c.status === "active") {
      next = paidThisPeriod ? dueDateOf(addPeriod(ref, freq), c.dueDay)
                            : dueDateOf(ref, c.dueDay);
      if (end && next > end) next = null;
    }
    const overdue = c.status === "active" && !paidThisPeriod && next && next < ref;
    const daysToEnd = end ? daysBetween(ref, end) : null;
    return { paidThisPeriod, paidTotal, totalPayments, remainingPayments,
             remainingBalance, progress, next, overdue, daysToEnd, curKey };
  };

  /* Unpaid commitments due within N days (or overdue), soonest first. */
  const dueList = (state, within = 14) => {
    const t0 = today();
    const out = [];
    for (const c of state.commitments) {
      if (c.status !== "active") continue;
      const st = commitmentStats(c, t0);
      if (st.paidThisPeriod || !st.next) continue;
      const days = daysBetween(t0, st.next);
      if (days <= within) out.push({ c, next: st.next, days, overdue: days < 0 });
    }
    return out.sort((a, b) => a.next - b.next);
  };

  /* Cumulative monthly cash flow released as commitments end. */
  const freedTimeline = (state) => {
    const list = state.commitments
      .filter(c => c.status === "active" && c.endDate)
      .map(c => ({ c, end: parseISO(c.endDate) }))
      .filter(x => x.end)
      .sort((a, b) => a.end - b.end);
    let cum = 0;
    return list.map(x => { cum += safe(x.c.amount); return { c: x.c, end: x.end, cum }; });
  };

  /* ---- household staff (Phase 4) ---- */
  const staffNet = (w) => Math.round(safe(w.salary) * (1 - safe(w.discountPct) / 100) * 100) / 100;

  /* Monthly staffing cost for the coming months under two permanent-worker
     arrival scenarios (A = earliest, B = latest). Month granularity; the
     handover month counts both workers — a deliberately conservative estimate.
     Assumes the temp worker leaves once the permanent one arrives. */
  const staffScenarios = (state, horizon = 6) => {
    const ws = ((state.household || {}).workers || []).filter(w => w.status !== "ended");
    const perm = ws.find(w => w.role === "permanent");
    const monthOf = (iso) => { const d = parseISO(iso); return d ? d.getFullYear() * 12 + d.getMonth() : null; };
    const permA = perm ? monthOf(perm.status === "active" && perm.startDate ? perm.startDate : perm.expectedFrom) : null;
    const permB = perm ? monthOf(perm.status === "active" && perm.startDate ? perm.startDate : (perm.expectedTo || perm.expectedFrom)) : null;
    const t0 = today();
    const rows = [];
    for (let i = 0; i < horizon; i++) {
      const mAbs = t0.getFullYear() * 12 + t0.getMonth() + i;
      const cost = (permStart) => {
        let sum = 0;
        for (const w of ws) {
          const net = staffNet(w);
          if (w.role === "permanent") {
            if (permStart !== null && mAbs >= permStart) sum += net;
            continue;
          }
          const from = monthOf(w.startDate || w.expectedFrom);
          if (from !== null && mAbs < from) continue;
          const to = monthOf(w.endDate);
          if (to !== null && mAbs > to) continue;
          if (w.role === "temp" && permStart !== null && mAbs > permStart) continue;
          sum += net;
        }
        return Math.round(sum * 100) / 100;
      };
      rows.push({ y: Math.floor(mAbs / 12), m: mAbs % 12, a: cost(permA), b: cost(permB) });
    }
    const tot = (k) => Math.round(rows.reduce((x, r) => x + r[k], 0) * 100) / 100;
    return { rows, totalA: tot("a"), totalB: tot("b"), hasPerm: !!perm };
  };

  /* ---- travel planner (Phase 5) ---- */
  const tripStats = (trip) => {
    const r2 = (n) => Math.round(safe(n) * 100) / 100;
    const items = trip.items || [];
    const planned = r2(items.reduce((a, i) => a + safe(i.planned), 0));
    const paid = r2(items.filter(i => i.paid).reduce((a, i) => a + safe(i.paidAmount), 0));
    const target = safe(trip.targetBudget);
    const remaining = r2(target - paid);
    const sD = parseISO(trip.startDate), eD = parseISO(trip.endDate);
    const nights = sD && eD ? Math.max(0, Math.round((eD - sD) / 86400000)) : 0;
    const days = nights ? nights + 1 : 0;
    const daysTo = sD ? daysBetween(today(), sD) : null;
    const booked = items.filter(i => i.booked).length;
    const paidCount = items.filter(i => i.paid).length;
    const cl = trip.checklist || [];
    const clDone = cl.filter(x => x.done).length;
    const denom = items.length * 2 + cl.length;
    const readiness = denom ? Math.round(((booked + paidCount + clDone) / denom) * 100) : 0;
    const dailyTotal = r2(safe(trip.dailyBudget) * days);
    return { planned, paid, target, remaining, nights, days, daysTo,
             booked, paidCount, clDone, clTotal: cl.length, itemCount: items.length,
             readiness, dailyTotal, overPlan: r2(planned - target) };
  };

  /* ---- monthly planner & 12-month forecast (Phase 6) ----
     Planned items are DERIVED from their sources on every call — never stored.
     That guarantees: no duplicate transactions, no balance effects until a
     payment is explicitly recorded, permanent linkage to the source record,
     and safe propagation of source edits to future months only (history is
     made of real transactions and is never touched). */
  const r2n = (n) => Math.round(n * 100) / 100;
  const monthWindow = (state, y, m) => {
    const st = state.settings.monthStart || 1;
    return { a: new Date(y, m, st), b: new Date(y, m + 1, st) };
  };
  const chargedThisMonth = (c, y, m) => {
    const freq = c.frequency || "monthly";
    const mAbs = y * 12 + m;
    const sD = c.startDate ? parseISO(c.startDate) : null;
    const eD = c.endDate ? parseISO(c.endDate) : null;
    if (sD && mAbs < sD.getFullYear() * 12 + sD.getMonth()) return false;
    if (eD && mAbs > eD.getFullYear() * 12 + eD.getMonth()) return false;
    if (freq === "monthly") return true;
    const per = freq === "yearly" ? 12 : 3;
    const anchor = sD ? sD.getFullYear() * 12 + sD.getMonth() : mAbs;
    return (mAbs - anchor) % per === 0;
  };
  const paidInMonth = (c, y, m) =>
    (c.payments || []).some(p => p.period === periodKey(new Date(y, m, 1), c.frequency || "monthly"));
  const hhWorkers = (state) => (((state.household || {}).workers) || []);
  const workerCommitmentIds = (state) =>
    new Set(hhWorkers(state).map(w => w.commitmentId).filter(Boolean));
  const salaryReceived = (state, a, b) =>
    state.transactions.some(x => x.kind === "income" && x.categoryId === "cat_salary" &&
      x.status === "paid" && x.date && parseISO(x.date) >= a && parseISO(x.date) < b);

  /* One month's plan: every expected in/out with its source link. */
  const plannerMonth = (state, offset = 0) => {
    const t0 = today();
    const ref = new Date(t0.getFullYear(), t0.getMonth() + offset, 1);
    const y = ref.getFullYear(), m = ref.getMonth();
    const mAbs = y * 12 + m;
    const clamp = (day) => clampDay(y, m, day || 1);
    const { a, b } = monthWindow(state, y, m);
    const rows = [];
    const sal = safe(state.settings.monthlySalary);
    if (sal > 0) rows.push({ day: clamp(state.settings.salaryDay), kind: "salary",
      refId: null, name: null, amount: sal, dir: "in", paid: salaryReceived(state, a, b) });
    const wkIds = workerCommitmentIds(state);
    for (const c of state.commitments) {
      if (c.status !== "active" || !chargedThisMonth(c, y, m)) continue;
      rows.push({ day: clamp(c.dueDay), kind: wkIds.has(c.id) ? "staff" : "commitment",
        refId: c.id, name: c.name, amount: safe(c.amount), dir: "out",
        paid: paidInMonth(c, y, m) });
    }
    /* expected (not yet activated) household staff — scenario-A view */
    const perm = hhWorkers(state).find(x => x.role === "permanent" && x.status !== "ended");
    for (const w of hhWorkers(state)) {
      if (w.status !== "expected" || !w.expectedFrom) continue;
      const from = parseISO(w.expectedFrom);
      if (!from || mAbs < from.getFullYear() * 12 + from.getMonth()) continue;
      if (w.role === "temp" && perm && perm.expectedFrom) {
        const pd = parseISO(perm.expectedFrom);
        if (pd && mAbs > pd.getFullYear() * 12 + pd.getMonth()) continue;
      }
      rows.push({ day: clamp(from.getDate()), kind: "staff", refId: w.id, name: w.name,
        amount: staffNet(w), dir: "out", paid: false, expected: true });
    }
    /* trip items: unpaid; undated items land in the trip's start month */
    for (const tp of state.trips) for (const it of (tp.items || [])) {
      if (it.paid) continue;
      const dd = it.dueDate ? parseISO(it.dueDate) : (tp.startDate ? parseISO(tp.startDate) : null);
      if (!dd || dd.getFullYear() !== y || dd.getMonth() !== m) continue;
      rows.push({ day: dd.getDate(), kind: "trip", refId: it.id, tripId: tp.id,
        name: it.name, amount: safe(it.planned), dir: "out", paid: false });
    }
    const ym = y + "-" + String(m + 1).padStart(2, "0");
    for (const ex of (((state.planner || {}).extras) || [])) {
      if (ex.ym !== ym) continue;
      rows.push({ day: clamp(ex.day), kind: "extra", refId: ex.id, name: ex.name,
        amount: safe(ex.amount), dir: ex.kind === "income" ? "in" : "out", paid: !!ex.done });
    }
    rows.sort((x, z) => x.day - z.day);
    const income = r2n(rows.filter(r => r.dir === "in").reduce((sm, r) => sm + r.amount, 0));
    const outflow = r2n(rows.filter(r => r.dir === "out").reduce((sm, r) => sm + r.amount, 0));
    let actualIncome = 0, actualExpense = 0;
    for (const x of state.transactions) {
      if (x.status !== "paid" || !x.date) continue;
      const dx = parseISO(x.date);
      if (!dx || dx < a || dx >= b) continue;
      if (x.kind === "income") actualIncome += safe(x.amount);
      else if (x.kind === "expense") actualExpense += safe(x.amount);
    }
    return { y, m, ym, rows, income, outflow, net: r2n(income - outflow),
             actualIncome: r2n(actualIncome), actualExpense: r2n(actualExpense) };
  };

  /* 12-month projection. Scenarios: contractual flows (salary, commitments)
     are identical everywhere; "best/worst" move only the flexible spending
     (×0.85 / ×1.15) and pick the cheaper/pricier staffing arrival month.
     Month 0 counts only what has NOT yet happened, so the cumulative line
     starts from the real current balance. */
  const forecast = (state, months = 12, scenario = "expected") => {
    const wf = Object.assign({ spendingFlex: 0, salaryDelta: 0, staffScenario: "a" },
      ((state.planner || {}).whatif) || {});
    const flexMult = scenario === "best" ? 0.85 : scenario === "worst" ? 1.15 : 1;
    const staffRows = staffScenarios(state, months).rows;
    const wkIds = workerCommitmentIds(state);
    const t0 = today();
    const start = netBalance(state);
    let cum = start;
    const rowsOut = [];
    for (let i = 0; i < months; i++) {
      const ref = new Date(t0.getFullYear(), t0.getMonth() + i, 1);
      const y = ref.getFullYear(), m = ref.getMonth();
      const { a, b } = monthWindow(state, y, m);
      let income = 0;
      const sal = Math.max(0, safe(state.settings.monthlySalary) + safe(wf.salaryDelta));
      if (!(i === 0 && salaryReceived(state, a, b))) income += sal;
      let outM = 0;
      for (const c of state.commitments) {
        if (c.status !== "active" || wkIds.has(c.id)) continue;
        if (!chargedThisMonth(c, y, m)) continue;
        if (i === 0 && paidInMonth(c, y, m)) continue;
        outM += safe(c.amount);
      }
      const sr = staffRows[i] || { a: 0, b: 0 };
      outM += scenario === "best" ? Math.min(sr.a, sr.b)
            : scenario === "worst" ? Math.max(sr.a, sr.b)
            : (wf.staffScenario === "b" ? sr.b : sr.a);
      if (i === 0) for (const w of hhWorkers(state)) {
        if (w.status !== "active" || !w.commitmentId) continue;
        const c = state.commitments.find(x => x.id === w.commitmentId);
        if (c && paidInMonth(c, y, m)) outM -= staffNet(w);
      }
      for (const tp of state.trips) for (const it of (tp.items || [])) {
        if (it.paid) continue;
        const dd = it.dueDate ? parseISO(it.dueDate) : (tp.startDate ? parseISO(tp.startDate) : null);
        if (dd && dd.getFullYear() === y && dd.getMonth() === m) outM += safe(it.planned);
      }
      const ym = y + "-" + String(m + 1).padStart(2, "0");
      for (const ex of (((state.planner || {}).extras) || [])) {
        if (ex.ym !== ym || ex.done) continue;
        if (ex.kind === "income") income += safe(ex.amount); else outM += safe(ex.amount);
      }
      outM += safe(wf.spendingFlex) * flexMult;
      income = r2n(income); outM = r2n(outM);
      const net = r2n(income - outM);
      cum = r2n(cum + net);
      rowsOut.push({ y, m, income, out: outM, net, cum });
    }
    return { start, rows: rowsOut, scenario };
  };

  /* ---- advisor analytics (Phase 7) — all derived, nothing stored ---- */
  /* The same components the health score is built from, exposed with numbers
     so the advisor can EXPLAIN the score instead of just showing it. */
  const healthParts = (state) => {
    const t = totals(state);
    const bal = netBalance(state);
    const loadRatio = t.salary > 0 ? t.outflow / t.salary : null;
    const loadPts = t.salary > 0 ? Math.max(0, Math.min(1, 1 - t.outflow / t.salary)) * 55 : 0;
    const bufferMonths = t.outflow > 0 ? bal / t.outflow : null;
    const bufferPts = t.outflow > 0 ? Math.min(bal / t.outflow, 3) / 3 * 35 : (bal > 0 ? 35 : 0);
    let bonus = 0;
    const soonFreed = endingSoon(state, 75).reduce((a, c) => a + safe(c.amount), 0);
    if (t.remaining < 0 && t.remaining + soonFreed > 0) bonus = 10;
    return { salary: t.salary, outflow: t.outflow, remaining: t.remaining, balance: bal,
             loadRatio, loadPts: r2n(loadPts), bufferMonths, bufferPts: r2n(bufferPts),
             bonus, soonFreed: r2n(soonFreed), score: healthScore(state).score };
  };

  /* Actual spending grouped by category for the planner month at `offset`. */
  const spendingByCategory = (state, offset = 0) => {
    const t0 = today();
    const ref = new Date(t0.getFullYear(), t0.getMonth() + offset, 1);
    const { a, b } = monthWindow(state, ref.getFullYear(), ref.getMonth());
    const byCat = new Map();
    let total = 0;
    for (const x of state.transactions) {
      if (x.kind !== "expense" || x.status !== "paid" || !x.date) continue;
      const dx = parseISO(x.date);
      if (!dx || dx < a || dx >= b) continue;
      const key = x.categoryId || "_none";
      byCat.set(key, r2n((byCat.get(key) || 0) + safe(x.amount)));
      total = r2n(total + safe(x.amount));
    }
    const rows = [...byCat.entries()].map(([categoryId, amount]) => ({ categoryId, amount }))
      .sort((x, z) => z.amount - x.amount);
    return { rows, total };
  };

  return { totals, netBalance, endingSoon, daysToTrip, healthScore, monthRange, monthStats,
           commitmentStats, dueList, freedTimeline, periodKey, parseISO, safe, today,
           staffNet, staffScenarios, tripStats, plannerMonth, forecast, chargedThisMonth,
           healthParts, spendingByCategory };
})();
