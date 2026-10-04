# Super-Cube® Learn: parent or guardian consent (learners under 18)

Version: `guardian-2026-10-v1` (4 October 2026). Prepared for Dr Craig Muller to review. Have a privacy practitioner check it before launch.
Legal basis: POPIA section 35(1)(a). A learner under 18 is a child under POPIA, so a competent person (a parent, legal guardian or other person with parental responsibility) must consent before we process the child's personal information.

---

## 1. In-app consent screen (shown on `/learn/consent`)

**Heading:** Before {child's name} starts

**Intro:**
Super-Cube® helps young people grow as leaders, and we look after their information carefully. South Africa's privacy law (POPIA) says a parent or guardian must agree before we use a child's personal information. Please read this with your child, then complete the form yourself.

**What you're agreeing to:**
- **Why:** We use your child's information only to run their Super-Cube® programme, show their progress and growth report, and issue their certificate. We never sell it, never use it for advertising, and never share it for anyone else's marketing.
- **What we collect:** their first name or nickname, age band and learning context (for example school or sport); their assessment answers and scores; their session progress and certificate; and their private reflections. If they sign in, we also store a login email. We do not collect ID numbers, photos, location or health information.
- **Who sees it:** your child, and you on their device or account. Reflections are always private. A coach or school only sees your child's scores and progress if your child joins their cohort with a code. They never see reflections. Any reports we publish or share with funders are anonymous and grouped (aggregate only).
- **How long we keep it:** while your child uses Super-Cube®. When you delete it, it is erased straight away from our live systems and from backups within 30 days. We keep only an anonymous note that a deletion happened.
- **Your rights:** you can withdraw consent or delete everything at any time from the You page (Delete my data), or by emailing us. You may also ask to see or correct your child's information. If you are unhappy with how we handle it, you can complain to the Information Regulator (inforegulator.org.za).
- **Good to know:** Super-Cube® is a self-reflection and learning tool. It is not a psychological or clinical assessment.
- **Questions:** hello@super-cube.me

**Checkbox (required):**
☐ I am this learner's parent, legal guardian or other person with parental responsibility. I have read the points above with my child, and I consent to Super-Cube® using my child's information as described, for their leadership programme. I know I can withdraw this consent or delete their data at any time.

**Button:** I consent · continue

**Footer note:** Consent version guardian-2026-10-v1. We'll only email you if you add your email address and ask us to.

---

## 2. Guardian email (template; NOT sent in Phase 0)

For Phase 1 email-verified consent, or a copy sent when a parent asks for one.

**Subject:** Your consent for {child's first name} on Super-Cube® Learn

Hi {guardian name},

Thank you for agreeing to let {child's first name} use Super-Cube® Learn, our leadership programme for young people.

A quick reminder of what you agreed to:
- **Why:** we use {child's first name}'s information only to run their programme, show their growth report and issue their certificate. We never sell it or use it for advertising.
- **What we keep:** first name, age band, learning context, assessment answers and scores, session progress, certificate and private reflections.
- **Who sees it:** {child's first name} and you. A coach or school sees scores and progress only if {child's first name} joins their cohort. Nobody but your child sees their reflections. Anything we report more widely is anonymous and grouped.
- **How long:** while {child's first name} uses Super-Cube®. Deleted data is erased straight away, and from backups within 30 days.

You can change your mind at any time:
- Withdraw consent or delete everything: open Super-Cube® Learn → You → Delete my data, or reply to this email.
- See or correct information: reply to this email.

{Confirm button (Phase 1): Yes, I give consent}
If you didn't expect this email, ignore it. Nothing happens unless you confirm.

Warm regards,
The Super-Cube® team
hello@super-cube.me · super-cube.me/privacy

---

## 3. Privacy policy section (add to `/privacy` under "Children & schools")

### Children under 18

We take extra care with children's information. Under POPIA section 35, a parent, legal guardian or other person with parental responsibility (a "competent person") must consent before a learner under 18 uses Super-Cube® Learn. If a school runs the programme, the school may collect that consent under its own parental consent process.

- **Purpose:** only to deliver the learner's programme, progress and growth report, and certificate. No selling, no advertising, no profiling for marketing.
- **What we collect:** first name or nickname, age band, learning context, assessment answers and scores, session progress, certificate, private reflections, and a login email if they sign in. We also keep a record of the consent (guardian's name, relationship, optional email, date and wording version).
- **Who can see it:** the learner and their parent or guardian. A coach or school sees scores and progress only if the learner joins their cohort. Reflections are never shared. Wider reports are anonymous and aggregated.
- **Retention:** kept while the learner uses Super-Cube®. Deleted on request immediately from live systems and from backups within 30 days. We keep only an anonymous deletion record.
- **Withdrawal and deletion:** a parent or guardian can withdraw consent at any time on the consent screen. Learning pauses until consent is given again. They can delete all data from You → Delete my data, or by emailing hello@super-cube.me. They may also ask to access or correct the information, or complain to the Information Regulator.
- **Not clinical:** results are developmental self-reflection, not a psychological assessment.

---

## Notes for Craig (not part of the wording)
1. **"Aggregate only" vs what the product does today:** you asked for coach/school access to be described as aggregate only. But the current coach roster shows each learner's own scores and progress (never reflections) for learners who joined that coach's cohort. So I wrote it accurately: individual scores and progress for cohort members, aggregate only for anything wider. If you want coaches to see only aggregates for under-18s, that needs a code change to the coach roster, plus this line: "A coach or school only ever sees grouped results for the whole class, never your child's individual scores or reflections."
2. **30-day backup window:** this assumes Supabase's standard backup retention (7 days on Pro), with headroom. Confirm it matches the plan.
3. **Names:** add the responsible party's legal name and Information Officer once confirmed. The privacy page currently names no entity.
4. **The email is not sent:** it's a template only. Phase 0 sends no email.
