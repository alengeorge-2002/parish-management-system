export interface LocalizedPrayerContent {
  title: string;
  subTitle?: string;
  paragraphs: string[];
}

export interface BilingualPrayer {
  id: string;
  en: LocalizedPrayerContent;
  ml: LocalizedPrayerContent;
}

export const prayersData: Record<string, BilingualPrayer> = {
  'morning-prayer': {
    id: 'morning-prayer',
    en: {
      title: 'Morning Prayer',
      subTitle: 'Lauds & Daily Morning Devotions',
      paragraphs: [
        '✠ In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
        'O my God, I adore You and I love You with all my heart. I thank You for having created me, made me a Christian, and preserved me through the night. I offer You all my actions of this day; grant that they all may be according to Your holy will.',
        'Our Father, Who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
        'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
        'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.'
      ]
    },
    ml: {
      title: 'പ്രഭാത പ്രാർത്ഥന',
      subTitle: 'രാവിലത്തെ യാമപ്രാർത്ഥനകളും വന്ദനങ്ങളും',
      paragraphs: [
        '✠ പിതാവിന്റെയും പുത്രന്റെയും പരിശുദ്ധാത്മാവിന്റെയും നാമത്തിൽ. ആമേൻ.',
        'എന്റെ ദൈവമേ, ഞാൻ അങ്ങയെ ആരാധിക്കുകയും എന്റെ പൂർണ്ണഹൃദയത്തോടെ സ്നേഹിക്കുകയും ചെയ്യുന്നു. എന്നെ സൃഷ്ടിച്ചതിനും ഒരു ക്രിസ്ത്യാനിയാക്കിയതിനും കഴിഞ്ഞ രാത്രിയിൽ എന്നെ കാത്തുസൂക്ഷിച്ചതിനും ഞാൻ അങ്ങേക്ക് നന്ദി പറയുന്നു. ഈ ദിവസത്തെ എന്റെ എല്ലാ പ്രവൃത്തികളെയും ഞാൻ അങ്ങേക്ക് സമർപ്പിക്കുന്നു; അവയെല്ലാം അങ്ങയുടെ തിരുഹിതത്തിനനുസൃതമായിരിക്കാൻ കൃപ ചെയ്യണമേ.',
        'സ്വർഗ്ഗസ്ഥനായ ഞങ്ങളുടെ പിതാവേ, അങ്ങയുടെ നാമം പൂജിതമാകണമേ, അങ്ങയുടെ രാജ്യം വരണമേ, അങ്ങയുടെ തിരുഹിതം സ്വർഗ്ഗത്തിലെപ്പോലെ ഭൂമിയിലും ആകണമേ. അന്നന്നുവേണ്ടുന്ന ആഹാരം ഇന്ന് ഞങ്ങൾക്ക് നൽകണമേ. ഞങ്ങളോട് തെറ്റ് ചെയ്യുന്നവരോട് ഞങ്ങൾ ക്ഷമിക്കുന്നതുപോലെ ഞങ്ങളുടെ തെറ്റുകൾ ഞങ്ങളോടും ക്ഷമിക്കണമേ. ഞങ്ങളെ പ്രലോഭനങ്ങളിൽ ഉൾപ്പെടുത്തരുതേ, തിന്മയിൽ നിന്ന് ഞങ്ങളെ രക്ഷിക്കണമേ. ആമേൻ.',
        'നന്മനിറഞ്ഞ മറിയമേ നിനക്ക് സ്വസ്തി, കർത്താവ് നിന്നോടുകൂടെ, സ്ത്രീകളിൽ നീ അനുഗ്രഹിക്കപ്പെട്ടവളാകുന്നു, നിന്റെ ഉദരത്തിൻ ഫലമായ ഈശോ അനുഗ്രഹിക്കപ്പെട്ടവനാകുന്നു. പരിശുദ്ധ മറിയമേ തമ്പുരാന്റെ അമ്മേ, പാപികളായ ഞങ്ങൾക്കുവേണ്ടി ഇപ്പോഴും ഞങ്ങളുടെ മരണസമയത്തും തമ്പുരാനോട് അപേക്ഷിച്ചുകൊള്ളണമേ. ആമേൻ.',
        'പിതാവിനും പുത്രനും പരിശുദ്ധാത്മാവിനും സ്തുതി. ആദിയിലെപ്പോലെ ഇപ്പോഴും എപ്പോഴും എന്നേക്കും. ആമേൻ.'
      ]
    }
  },
  'evening-prayer': {
    id: 'evening-prayer',
    en: {
      title: 'Evening Prayer',
      subTitle: 'Vespers & Night Examination of Conscience',
      paragraphs: [
        '✠ In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
        'O my God, I thank You for all the benefits which I have received from You this day and throughout my life. Give me light to see my sins and grace to be truly sorry for them.',
        'Act of Contrition: O my God, I am heartily sorry for having offended You, and I detest all my sins because of Your just punishments, but most of all because they offend You, my God, Who art all-good and deserving of all my love. I firmly resolve, with the help of Your grace, to sin no more and to avoid the near occasions of sin. Amen.',
        'We fly to thy patronage, O holy Mother of God; despise not our petitions in our necessities, but deliver us always from all dangers, O glorious and blessed Virgin. Amen.',
        'May the souls of the faithful departed, through the mercy of God, rest in peace. Amen.'
      ]
    },
    ml: {
      title: 'സന്ധ്യാ പ്രാർത്ഥന',
      subTitle: 'സന്ധ്യാ പ്രാർത്ഥനകളും മനസ്താപപ്രകരണവും',
      paragraphs: [
        '✠ പിതാവിന്റെയും പുത്രന്റെയും പരിശുദ്ധാത്മാവിന്റെയും നാമത്തിൽ. ആമേൻ.',
        'എന്റെ ദൈവമേ, ഈ ദിവസത്തിലും എന്റെ ജീവിതകാലം മുഴുവനിലും അങ്ങയിൽ നിന്ന് ഞാൻ കൈപ്പറ്റിയ എല്ലാ അനുഗ്രഹങ്ങൾക്കും ഞാൻ നന്ദി പറയുന്നു. എന്റെ പാപങ്ങൾ കാണാൻ എനിക്ക് വെളിച്ചവും അവയെക്കുറിച്ച് സങ്കടപ്പെടാൻ എനിക്ക് കൃപയും നൽകണമേ.',
        'മനസ്താപപ്രകരണം: എന്റെ ദൈവമേ, ഏറ്റവും നന്മസ്വരൂപനും എല്ലാ സ്നേഹത്തിനും യോഗ്യനുമായ അങ്ങേക്കെതിരായി പാപം ചെയ്തുപോയതിനാൽ ഞാൻ പൂർണ്ണഹൃദയത്തോടെ മനസ്തപിക്കുകയും അവയെ വെറുക്കുകയും ചെയ്യുന്നു. അങ്ങയുടെ സഹായത്താൽ ഇനിമേൽ പാപം ചെയ്യുകയില്ലെന്നും പാപസാഹചര്യങ്ങൾ ഒഴിവാക്കുമെന്നും ഞാൻ ദൃഢമായി പ്രതിജ്ഞ ചെയ്യുന്നു. ആമേൻ.',
        'സർവ്വേശ്വരന്റെ പരിശുദ്ധ മാതാവേ, ഞങ്ങളുടെ ആവശ്യങ്ങളിൽ ഞങ്ങളുടെ അപേക്ഷകളെ തള്ളിക്കളയരുതേ. ഭാഗ്യവതിയും അനുഗ്രഹീതയുമായ കന്യകാമറിയമേ, സകല ആപത്തുകളിൽ നിന്നും എപ്പോഴും ഞങ്ങളെ കാത്തുരക്ഷിക്കണമേ. ആമേൻ.',
        'മരിച്ച വിശ്വാസികളുടെ ആത്മാക്കൾ ദൈവകാരുണ്യത്താൽ നിത്യശാന്തിയിൽ വിശ്രമിക്കട്ടെ. ആമേൻ.'
      ]
    }
  },
  'holy-rosary': {
    id: 'holy-rosary',
    en: {
      title: 'Holy Rosary',
      subTitle: 'Mysteries of the Holy Rosary',
      paragraphs: [
        'Apostles\' Creed: I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, Who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
        'How to pray the Mysteries: For each decade, announce the Mystery (Joyful, Sorrowful, Glorious, or Luminous), recite one Our Father, ten Hail Marys, and one Glory Be. End with the Fatima Prayer.',
        'Fatima Prayer: O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those most in need of Thy mercy. Amen.',
        'Hail Holy Queen: Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope! To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious Advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.'
      ]
    },
    ml: {
      title: 'വിശുദ്ധ ജപമാല',
      subTitle: 'ജപമാല സമർപ്പണവും മദ്ധ്യസ്ഥപ്രാർത്ഥനകളും',
      paragraphs: [
        'വിശ്വാസപ്രമാണം: സർവ്വശക്തനായ പിതാവും ആകാശത്തിന്റെയും ഭൂമിയുടെയും സ്രഷ്ടാവുമായ ദൈവത്തിൽ ഞാൻ വിശ്വസിക്കുന്നു. അവിടുത്തെ ഏകപുത്രനും ഞങ്ങളുടെ കർത്താവുമായ ഈശോമിശിഹായിലും ഞാൻ വിശ്വസിക്കുന്നു. ഈ മകൻ പരിശുദ്ധാത്മാവിനാൽ ഗർഭസ്ഥനായി കന്യകാമറിയത്തിൽ നിന്ന് ജനിച്ച്, പന്തിയോസ് പീലാത്തോസിന്റെ കാലത്ത് പീഡകൾ സഹിച്ച്, കുരിശിൽ തറയ്ക്കപ്പെട്ട്, മരിച്ച്, അടക്കപ്പെട്ടു; പാതാളങ്ങളിൽ ഇറങ്ങി, മൂന്നാം നാൾ മരിച്ചവരിൽ നിന്ന് ഉയിർത്തു; സ്വർഗ്ഗത്തിലേക്ക് എഴുന്നള്ളി, സർവ്വശക്തനായ ദൈവപിതാവിന്റെ വലതുഭാഗത്ത് ഇരിക്കുന്നു; അവിടെനിന്ന് ജീവിക്കുന്നവരെയും മരിച്ചവരെയും വിധിക്കാൻ വരുമെന്നും ഞാൻ വിശ്വസിക്കുന്നു. പരിശുദ്ധാത്മാവിലും വിശ്വസിക്കുന്നു. വിശുദ്ധ കത്തോലിക്കാ സഭയിലും, പുണ്യവാന്മാരുടെ ഐക്യത്തിലും, പാപങ്ങളുടെ മോചനത്തിലും, ശരീരത്തിന്റെ ഉയിർപ്പിലും, നിത്യമായ ജീവിതത്തിലും ഞാൻ വിശ്വസിക്കുന്നു. ആമേൻ.',
        'ജപമാല ചൊല്ലേണ്ട രീതി: ഓരോ ദശകത്തിനും മുമ്പായി നിശ്ചിത രഹസ്യങ്ങൾ (സന്തോഷം, ദുഃഖം, മഹിമ, പ്രകാശം) ധ്യാനിക്കുക. ഒരു സ്വർഗ്ഗസ്ഥനായ പിതാവേ, പത്ത് നന്മനിറഞ്ഞ മറിയമേ, ഒരു ത്രിത്വസ്തുതി ചൊല്ലുക. ഓരോ ദശകത്തിന്റെയും ഒടുവിൽ ഫാത്തിമ പ്രാർത്ഥന ചൊല്ലുക.',
        'ഫാത്തിമ പ്രാർത്ഥന: ഓ എന്റെ ഈശോയേ, ഞങ്ങളുടെ പാപങ്ങൾ ക്ഷമിക്കണമേ, നരകാഗ്നിയിൽ നിന്ന് ഞങ്ങളെ രക്ഷിക്കണമേ. എല്ലാ ആത്മാക്കളെയും, പ്രത്യേകം അങ്ങയുടെ കാരുണ്യം കൂടുതൽ ആവശ്യമുള്ളവരെയും സ്വർഗ്ഗത്തിലേക്ക് ആനയിക്കണമേ. ആമേൻ.',
        'പരിശുദ്ധ രാജ്ഞീ: പരിശുദ്ധ രാജ്ഞീ, കാരുണ്യത്തിന്റെ അമ്മേ, ഞങ്ങളുടെ ജീവനും മാധുര്യവും ശരണവുമേ സ്വസ്തി! ഹവ്വയുടെ മക്കളായ ഞങ്ങൾ അങ്ങേക്കുവേണ്ടി നിലവിളിക്കുന്നു. ഈ കണ്ണീർ താഴ്‌വരയിൽ നിന്ന് അങ്ങയോട് ഞങ്ങൾ നെടുവീർപ്പിടുന്നു. ആകയാൽ ഞങ്ങളുടെ മദ്ധ്യസ്ഥേ, അങ്ങയുടെ കരുണയുള്ള കണ്ണുകൾ ഞങ്ങളുടെ നേരെ തിരിക്കണമേ. ഞങ്ങളുടെ ഈ പ്രവാസത്തിന് ശേഷം അങ്ങയുടെ ഉദരത്തിന്റെ അനുഗൃഹീത ഫലമായ ഈശോയെ ഞങ്ങൾക്ക് കാണിച്ചുതരണമേ. കരുണയും വാത്സല്യവുമുള്ള മധുര മറിയമേ! ആമേൻ.'
      ]
    }
  },
  'stations-of-the-cross': {
    id: 'stations-of-the-cross',
    en: {
      title: 'Stations of the Cross',
      subTitle: 'The Fourteen Stations of the Holy Cross',
      paragraphs: [
        'Opening Prayer: My Lord Jesus Christ, You have made this journey to die for me with love unutterable, and I have so many times unworthily abandoned You; but now I love You with my whole heart, and because I love You, I repent sincerely for having ever offended You. Pardon me, my God, and permit me to accompany You on this journey.',
        '1. Jesus is Condemned to Death: We adore You, O Christ, and we praise You, because by Your Holy Cross You have redeemed the world. Jesus, condemned to death, grant us the grace to accept all tribulations.',
        '2. Jesus Carries His Cross: Jesus, carrying Your heavy cross, teach us to bear our daily crosses with patience.',
        '3. Jesus Falls the First Time: Jesus, falling under the weight of our sins, lift us up when we fall into error.',
        '4. Jesus Meets His Afflicted Mother: Jesus, meeting Mary in Your suffering, comfort all mothers in grief.',
        '5. Simon of Cyrene Helps Jesus: Simon helps You carry the cross; teach us to support our neighbors in need.',
        '6. Veronica Wipes the Face of Jesus: Veronica wipes Your holy face; imprint Your sacred image in our hearts.',
        '7. Jesus Falls the Second Time: Jesus, falling again, grant us perseverance in grace.',
        '8. Jesus Meets the Women of Jerusalem: You comfort the weeping women; teach us to weep for our sins.',
        '9. Jesus Falls the Third Time: Jesus, falling the third time, deliver us from despair and spiritual dryness.',
        '10. Jesus is Stripped of His Garments: Stripped of Your robes, teach us detachment from worldly goods.',
        '11. Jesus is Nailed to the Cross: Nailed to the wood of the cross, bind our wills to Your divine law.',
        '12. Jesus Dies on the Cross: Dying for our salvation, we place our souls into Your hands.',
        '13. Jesus is Taken Down from the Cross: Placed in the arms of Your Mother, fill us with holy devotion.',
        '14. Jesus is Laid in the Tomb: Laid in the tomb, grant us the hope of the glorious resurrection. Amen.'
      ]
    },
    ml: {
      title: 'കുരിശിന്റെ വഴി',
      subTitle: 'ഈശോമിശിഹായുടെ പീഡാനുഭവ സ്മരണ',
      paragraphs: [
        'ആരംഭ പ്രാർത്ഥന: എന്റെ കർത്താവായ യേശുക്രിസ്തുവേ, അങ്ങ് എന്നെ സ്നേഹിച്ചതുകൊണ്ട് എനിക്കുവേണ്ടി മരിക്കാൻ ഈ യാത്ര ചെയ്തു. ഞാൻ പലപ്പോഴും അങ്ങയെ ഉപേക്ഷിച്ചിട്ടുണ്ട്. എന്നാൽ ഇപ്പോൾ ഞാൻ പൂർണ്ണഹൃദയത്തോടെ അങ്ങയെ സ്നേഹിക്കുന്നു. അങ്ങയെ വേദനിപ്പിച്ചതിൽ ഞാൻ ആത്മാർത്ഥമായി ഖേദിക്കുന്നു. എന്റെ ദൈവമേ, എന്നോട് ക്ഷമിക്കണമേ, ഈ യാത്രയിൽ അങ്ങയെ അനുഗമിക്കാൻ എന്നെ അനുവദിക്കണമേ.',
        '1. ഈശോ മരണത്തിന് വിധിക്കപ്പെടുന്നു: ഈശോമിശിഹായേ, ഞങ്ങൾ അങ്ങയെ ആരാധിച്ചു സ്തുതിക്കുന്നു. എന്തുകൊണ്ടെന്നാൽ വിശുദ്ധ കുരിശിനാൽ അങ്ങ് ലോകത്തെ വീണ്ടെടുത്തു. മരണത്തിന് വിധിക്കപ്പെട്ട ഈശോയേ, എല്ലാ കഷ്ടപ്പാടുകളും സഹിഷ്ണുതയോടെ സ്വീകരിക്കാൻ ഞങ്ങളെ സഹായിക്കണമേ.',
        '2. ഈശോ കുരിശ് ചുമക്കുന്നു: കുരിശുമരം ചുമലിലേറ്റിയ ഈശോയേ, ഞങ്ങളുടെ ദൈനംദിന കുരിശുകൾ സഹിഷ്ണുതയോടെ വഹിക്കാൻ ഞങ്ങളെ പഠിപ്പിക്കണമേ.',
        '3. ഈശോ ഒന്നാം പ്രാവശ്യം വീഴുന്നു: ഞങ്ങളുടെ പാപഭാരത്താൽ വീണുപോയ ഈശോയേ, ഞങ്ങൾ പാപത്തിൽ വീഴുമ്പോൾ ഞങ്ങളെ എഴുന്നേൽപ്പിക്കണമേ.',
        '4. ഈശോ വഴിയിൽവെച്ച് മാതാവിനെ കാണുന്നു: ദുഃഖിതയായ അമ്മയെ കണ്ടുമുട്ടിയ ഈശോയേ, ദുഃഖിക്കുന്ന എല്ലാ മാതാപിതാക്കളെയും അങ്ങ് ആശ്വസിപ്പിക്കണമേ.',
        '5. ശിമയോൻ ഈശോയെ സഹായിക്കുന്നു: ഈശോയെ കുരിശ് ചുമക്കാൻ ശിമയോൻ സഹായിക്കുന്നു; ഞങ്ങളുടെ സഹോദരങ്ങളെ സഹായിക്കാൻ ഞങ്ങളെ പഠിപ്പിക്കണമേ.',
        '6. വേറോനിക്ക ഈശോയുടെ മുഖം തുടയ്ക്കുന്നു: അങ്ങയുടെ മുഖം തുടച്ച വേറോനിക്കയെപ്പോലെ, അങ്ങയുടെ തിരുരൂപം ഞങ്ങളുടെ ഹൃദയങ്ങളിൽ പതിപ്പിക്കണമേ.',
        '7. ഈശോ രണ്ടാം പ്രാവശ്യം വീഴുന്നു: വീണ്ടും വീണുപോയ ഈശോയേ, നന്മയിൽ ജീവിക്കാൻ ഞങ്ങൾക്ക് സ്ഥിരത നൽകണമേ.',
        '8. ഈശോ ഓർശ്ലെം സ്ര്തീകളെ ആശ്വസിപ്പിക്കുന്നു: കരയുന്ന സ്ത്രീകളെ ആശ്വസിപ്പിച്ച ഈശോയേ, ഞങ്ങളുടെ പാപങ്ങളെ ഓർത്തു കരയാൻ ഞങ്ങളെ പഠിപ്പിക്കണമേ.',
        '9. ഈശോ മൂന്നാം പ്രാവശ്യം വീഴുന്നു: മൂന്നാം പ്രാവശ്യം വീണ ഈശോയേ, ഞങ്ങളെ നിരാശയിൽ നിന്നും ആത്മീയ വരൾച്ചയിൽ നിന്നും രക്ഷിക്കണമേ.',
        '10. ഈശോയുടെ വസ്ത്രങ്ങൾ ഉരിഞ്ഞെടുക്കപ്പെടുന്നു: വസ്ത്രങ്ങൾ ഉരിഞ്ഞെടുക്കപ്പെട്ട ഈശോയേ, ലൗകിക മോഹങ്ങളിൽ നിന്ന് ഞങ്ങളുടെ മനസ്സിനെ മോചിപ്പിക്കണമേ.',
        '11. ഈശോ കുരിശിൽ തറയ്ക്കപ്പെടുന്നു: കുരിശിൽ തറയ്ക്കപ്പെട്ട ഈശോയേ, ഞങ്ങളുടെ ഇച്ഛകളെ അങ്ങയുടെ തിരുഹിതത്തോട് ചേർത്തു നിർത്തണമേ.',
        '12. ഈശോ കുരിശിൽ മരിക്കുന്നു: ലോകരക്ഷയ്ക്കായി ജീവൻ വെടിഞ്ഞ ഈശോയേ, ഞങ്ങളുടെ ആത്മാക്കളെ അങ്ങയുടെ കരങ്ങളിൽ സമർപ്പിക്കുന്നു.',
        '13. ഈശോയെ മടിയിൽ കിടത്തുന്നു: അമ്മയുടെ മടിയിൽ കിടത്തപ്പെട്ട ഈശോയേ, ഞങ്ങളിൽ ദൈവഭക്തി വളർത്തണമേ.',
        '14. ഈശോ കല്ലറയിൽ അടക്കപ്പെടുന്നു: കല്ലറയിൽ അടക്കപ്പെട്ട ഈശോയേ, മഹത്വപൂർണ്ണമായ ഉത്ഥാനത്തിന്റെ പ്രത്യാശ ഞങ്ങൾക്ക് നൽകണമേ. ആമേൻ.'
      ]
    }
  },
  'bible-readings': {
    id: 'bible-readings',
    en: {
      title: 'Bible Readings',
      subTitle: 'Liturgy of the Word & Daily Verses',
      paragraphs: [
        'First Reading (Deuteronomy 6:4-7): Hear, O Israel: The Lord our God, the Lord is one. Love the Lord your God with all your heart and with all your soul and with all your strength. These commandments that I give you today are to be on your hearts. Impress them on your children. Talk about them when you sit at home and when you walk along the road, when you lie down and when you get up.',
        'Responsolial Psalm (Psalm 23): The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name\'s sake.',
        'Second Reading (Romans 12:1-2): Therefore, I urge you, brothers and sisters, in view of God\'s mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship. Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is—his good, pleasing and perfect will.',
        'Gospel (John 14:6): Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."'
      ]
    },
    ml: {
      title: 'തിരുവചന വായനകൾ',
      subTitle: 'ഇന്നത്തെ ബൈബിൾ വായനകളും ധ്യാനങ്ങളും',
      paragraphs: [
        'ഒന്നാം വായന (നിയമാവർത്തനം 6:4-7): ഇസ്രായേലേ കേൾക്കുക: നമ്മുടെ ദൈവമായ കർത്താവ് ഒരുവൻ മാത്രമാകുന്നു. നീ നിന്റെ ദൈവമായ കർത്താവിനെ പൂർണ്ണഹൃദയത്തോടും പൂർണ്ണാത്മാവോടും പൂർണ്ണശക്തിയോടും കൂടെ സ്നേഹിക്കണം. ഇന്ന് ഞാൻ നിന്നോട് ആജ്ഞാപിക്കുന്ന ഈ വചനങ്ങൾ നിന്റെ ഹൃദയത്തിലുണ്ടായിരിക്കണം. നീ അവ നിന്റെ മക്കൾക്ക് ഉപദേശിച്ചുകൊടുക്കണം.',
        'പ്രതിവചന സങ്കീർത്തനം (സങ്കീർത്തനങ്ങൾ 23): കർത്താവാണ് എന്റെ ഇടയൻ; എനിക്ക് ഒന്നിനും കുറവുണ്ടാകുകയില്ല. പച്ചപ്പുല്ലുള്ള മേച്ചിൽസ്ഥലങ്ങളിൽ അവിടുന്ന് എന്നെ കിടത്തുന്നു; ശാന്തമായ ജലാശയങ്ങളിലേക്ക് അവിടുന്ന് എന്നെ നയിക്കുന്നു.',
        'രണ്ടാം വായന (റോമാക്കാർക്ക് എഴുതിയ ലേഖനം 12:1-2): ആകയാൽ സഹോദരരേ, ദൈവത്തിന്റെ കാരുണ്യം ഓർമ്മിച്ചുകൊണ്ട് ഞാൻ നിങ്ങളോട് അപേക്ഷിക്കുന്നു: നിങ്ങൾ നിങ്ങളുടെ ശരീരങ്ങളെ ജീവനുള്ളതും വിശുദ്ധവും ദൈവത്തിന് പ്രീതികരവുമായ ബലിയായി സമർപ്പിക്കുവിൻ; ഇതാണ് നിങ്ങളുടെ ആത്മീയ ആരാധന. ഈ ലോകത്തിന് അനുരൂപരാകാതെ, മനസ്സിന്റെ നവീകരണം വഴി രൂപാന്തരപ്പെടുവിൻ.',
        'സുവിശേഷം (യോഹന്നാൻ 14:6): ഈശോ അവനോട് പറഞ്ഞു: "വഴിയും സത്യവും ജീവനും ഞാനാകുന്നു. എന്നിലൂടെയല്ലാതെ ആരും പിതാവിന്റെ അടുക്കലേക്ക് വരുന്നില്ല."'
      ]
    }
  },
  'novena-prayers': {
    id: 'novena-prayers',
    en: {
      title: 'Novena Prayers',
      subTitle: 'Novenas to Sacred Heart, St. Jude, and Mother of Perpetual Succour',
      paragraphs: [
        'Novena to the Sacred Heart of Jesus: Divine Jesus, You have said: "Ask and you shall receive; seek and you shall find; knock and it shall be opened unto you." Behold, we kneel before You, filled with lively faith and respect, asking for Your divine assistance. Holy Heart of Jesus, we place all our trust in You.',
        'Novena to St. Jude Thaddeus: Most holy Apostle, St. Jude, faithful servant and friend of Jesus, the patron of difficult and hopeless cases, pray for me, who am so miserable. Make use, I implore you, of that particular privilege given to you, to bring visible and speedy help where help is almost despaired of.',
        'Novena to Our Mother of Perpetual Succour: O Mother of Perpetual Succour, behold, at thy feet a miserable sinner who has recourse to thee and puts his trust in thee. O Mother of Mercy, have pity on me. I hear thee called by all the refuge and hope of sinners: be then, my refuge and my hope.'
      ]
    },
    ml: {
      title: 'വിവിധ നൊവേനകൾ',
      subTitle: 'ഈശോയുടെ തിരുഹൃദയം, വി. യൂദാ ശ്ലീഹാ, നിത്യസഹായ മാതാവ്',
      paragraphs: [
        'ഈശോയുടെ തിരുഹൃദയത്തോടുള്ള നൊവേന: ദിവ്യനായ ഈശോയേ, "ചോദിക്കുവിൻ നിങ്ങൾക്ക് ലഭിക്കും, അന്വേഷിക്കുവിൻ നിങ്ങൾ കണ്ടെത്തും, മുട്ടുവിൻ നിങ്ങൾക്ക് തുറക്കപ്പെടും" എന്ന് അങ്ങ് അരുളിച്ചെയ്തിട്ടുണ്ടല്ലോ. തികഞ്ഞ വിശ്വാസത്തോടും ആദരവോടും കൂടെ അങ്ങയുടെ തിരുമുമ്പിൽ ഞങ്ങൾ മുട്ടുകുത്തുന്നു. ഈശോയുടെ ദിവ്യഹൃദയമേ, ഞങ്ങൾ അങ്ങയിൽ പൂർണ്ണമായി ശരണപ്പെടുന്നു.',
        'വിശുദ്ധ യൂദാ ശ്ലീഹായോടുള്ള നൊവേന: ഏറ്റവും പരിശുദ്ധനായ ശ്ലീഹാ അപ്പോസ്തലനായ വിശുദ്ധ യൂദാ തദേവൂസേ, ഈശോയുടെ വിശ്വസ്ത ദാസനും സ്നേഹിതനുമേ, അസാധ്യമായ കാര്യങ്ങളുടെ മദ്ധ്യസ്ഥനായ അങ്ങ് എനിക്കുവേണ്ടി പ്രാർത്ഥിക്കണമേ. യാതൊരു സഹായവും ലഭിക്കില്ലെന്ന് വിചാരിക്കുന്ന സമയത്ത് എന്നെ സഹായിക്കണമേ.',
        'നിത്യസഹായ മാതാവിനോടുള്ള നൊവേന: നിത്യസഹായ മാതാവേ, അങ്ങയുടെ സന്നിധിയിൽ അണഞ്ഞിരിക്കുന്ന പാപിയായ എന്നെ കടാക്ഷിക്കണമേ. പാപികളുടെ സങ്കേതവും പ്രത്യാശയുമായ അമ്മേ, എന്റെ സങ്കേതവും പ്രത്യാശയുമായിരിക്കണമേ. കരുണയുള്ള അമ്മേ, എന്നെ കാത്തുരക്ഷിക്കണമേ.'
      ]
    }
  },
  'audio-bible': {
    id: 'audio-bible',
    en: {
      title: 'Audio Bible',
      subTitle: 'Guided Audio Scripture Narration',
      paragraphs: [
        'Audio Scripture readings and podcast features will be loaded directly into this section in the next application version.',
        'You will soon be able to listen to daily Gospel reflections, liturgical prayers, and guided meditations directly within this interface.',
        'Stay tuned for updates!'
      ]
    },
    ml: {
      title: 'ഓഡിയോ ബൈബിൾ',
      subTitle: 'വിശുദ്ധ ഗ്രന്ഥ ശ്രവണവും വചന ധ്യാനങ്ങളും',
      paragraphs: [
        'ഓഡിയോ ബൈബിൾ വായനകളും പോഡ്കാസ്റ്റ് ഫീച്ചറുകളും അടുത്ത അപ്ഡേറ്റിൽ ഈ വിഭാഗത്തിൽ നേരിട്ട് ലഭ്യമാകുന്നതാണ്.',
        'ദൈനംദിന സുവിശേഷ വായനകൾ, തിരുക്കർമ്മ ഗീതങ്ങൾ, ഗൈഡഡ് മെഡിറ്റേഷനുകൾ എന്നിവ നിങ്ങൾക്ക് ഇതിലൂടെ ശ്രവിക്കാം.',
        'പുതിയ അപ്ഡേറ്റുകൾക്കായി കാത്തിരിക്കുക!'
      ]
    }
  },
  'prayer-requests': {
    id: 'prayer-requests',
    en: {
      title: 'Prayer Requests',
      subTitle: 'Parish Prayer Circle & Intentions Box',
      paragraphs: [
        'Submit your prayer intentions and requests to our parish prayer group circle directly through this screen in the next update.',
        'Our intercessory prayer teams pray daily for all intentions placed in the virtual intentions box.',
        'Feature coming soon!'
      ]
    },
    ml: {
      title: 'പ്രാർത്ഥനാ സഹായങ്ങൾ',
      subTitle: 'ഇടവക പ്രാർത്ഥനാ നിയോഗ പെട്ടി',
      paragraphs: [
        'നിങ്ങളുടെ പ്രാർത്ഥനാ നിയോഗങ്ങളും ആവശ്യങ്ങളും ഞങ്ങളുടെ ഇടവക പ്രാർത്ഥനാ ഗ്രൂപ്പിന് സമർപ്പിക്കാനുള്ള സൗകര്യം അടുത്ത അപ്ഡേറ്റിൽ ലഭ്യമാകും.',
        'ഞങ്ങളുടെ പ്രാർത്ഥനാ കൂട്ടായ്മ എല്ലാ ദിവസവും ഇവിടെ സമർപ്പിക്കപ്പെടുന്ന നിയോഗങ്ങൾക്ക് വേണ്ടി പ്രത്യേകം പ്രാർത്ഥിക്കുന്നതാണ്.',
        'ഈ സൗകര്യം ഉടൻ ലഭ്യമാകും!'
      ]
    }
  }
};
