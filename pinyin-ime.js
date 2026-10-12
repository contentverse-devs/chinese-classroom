/* Chinese Classroom: offline Pinyin suggestions, no network or license changes. */
(()=>{'use strict';
const dictionary=new Map();
const norm=s=>String(s||'').toLowerCase().replace(/u:/g,'ü').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ü/g,'v').replace(/[^a-zv\s']/g,' ').replace(/\s+/g,' ').trim();
function add(py,han,priority=false){const k=norm(py),h=String(han||'').trim();if(!k||!h||!/\p{Script=Han}/u.test(h))return;const a=dictionary.get(k)||[];if(!a.includes(h)){priority?a.unshift(h):a.push(h);dictionary.set(k,a)}}
const common={wo:'我',ni:'你',ta:'他',women:'我们',nimen:'你们',shi:'是',bu:'不',mei:'没',you:'有',mai:'买',mai2:'卖',yi:'一',fu:'服',yifu:'衣服',he:'喝',shui:'水',cha:'茶',kafei:'咖啡',xiang:'想',yao:'要',qu:'去',lai:'来',zai:'在',zhe:'这',na:'那',ge:'个','yi ge':'一个','yi bei':'一杯',hen:'很',hao:'好','ni hao':'你好',xiexie:'谢谢','xie xie':'谢谢',zaijian:'再见','zai jian':'再见','jin tian':'今天','ming tian':'明天','zuo tian':'昨天','xian zai':'现在','xue sheng':'学生','lao shi':'老师','tong xue':'同学',jia:'家','ba ba':'爸爸','ma ma':'妈妈','peng you':'朋友','gong zuo':'工作','shang ban':'上班','xue xiao':'学校','yi yuan':'医院','yi fu':'衣服','duo shao':'多少','duo shao qian':'多少钱',qian:'钱',tai:'太',gui:'贵','pian yi':'便宜','he shi':'合适','ke yi':'可以','bu ke yi':'不可以',dui:'对','dui bu qi':'对不起','mei guan xi':'没关系',qing:'请',wen:'问','zhe ge':'这个','na ge':'那个','yi dian':'一点',da:'大',xiao:'小',hong:'红',lan:'蓝',bai:'白',hei:'黑',ling:'零',er:'二',san:'三',si:'四',wu:'五',liu:'六',qi:'七',ba:'八',jiu:'九','shi fen':'十分','yi bai':'一百',ji:'几',ren:'人',chi:'吃',fan:'饭','mi fan':'米饭','mian tiao':'面条',kan:'看',ting:'听',shuo:'说',du:'读',xie:'写','han yu':'汉语','zhong wen':'中文','zhong guo':'中国','yue nan':'越南','ying yu':'英语','ren shi':'认识',jiao:'叫',gaoxing:'高兴','gao xing':'高兴',xihuan:'喜欢','xi huan':'喜欢','bu xiang':'不想','bu shi':'不是',hui:'会','bu hui':'不会',neng:'能','bu neng':'不能','yi jing':'已经','zheng zai':'正在','fei chang':'非常',le:'了',ma:'吗',ne:'呢',de:'的',di:'地',ba:'把',bei:'被',he2:'和',gen:'跟',dou:'都',ye:'也',hai:'还',zai2:'再',jiu:'就',cai:'才','dou shao':'多少',zuo:'做','zhe jian':'这件','ku zi':'裤子','qun zi':'裙子','yan se':'颜色','chi cun':'尺寸','shi yi shi':'试一试'};
for(const [k,v] of Object.entries(common))if(!/\d/.test(k))add(k,v,true);
// Prefer a general-purpose dictionary. Lesson vocabulary may supplement it,
// but never index complete exercise sentences or dialogues as candidate answers.
const homophones={
 shi:['是','十','时','事','试','市','师','室','使','世','式','石','食','识'],
 mai:['买','卖','麦','迈','脉','埋'],wo:['我','握','窝'],ni:['你','呢','泥'],
 yi:['一','衣','医','依','意','以','已','易','义','艺','亿','椅'],
 fu:['服','福','付','父','夫','复','副','富','府','扶'],
 he:['喝','和','河','合','何','盒','贺'],
 shui:['水','谁','睡','税'],xiang:['想','向','像','象','香','乡','相'],
 yao:['要','药','摇','咬','腰','遥'],zai:['在','再','载','灾'],
 zhe:['这','着','者','折'],na:['那','哪','拿','纳'],
 ge:['个','各','歌','哥','格','隔'],hao:['好','号','毫','豪'],
 kan:['看','刊','砍'],xie:['写','谢','鞋','些','血'],
 yi_fu:['衣服','依附'],
};

for(const [py,values] of Object.entries(homophones))for(const h of values)add(py.replace(/_/g,' '),h);
for(const l of window.CC_LESSONS||[]){
 for(const w of [...(l.focusWords||[]),...(l.vocabulary||[])])add(w.pinyin,w.han);
 for(const s of [...(l.steps||[]),...(l.items||[])])if(!Array.isArray(s))for(const t of s.tokens||[])add(t.pinyin,t.han);
 for(const line of l.dialogue||[])for(const t of line.tokens||[])add(t.pinyin,t.han);
}
for(const [k,values] of [...dictionary])if(k.includes(' '))for(const h of values)add(k.replace(/ /g,''),h);

 // Extended general-use dictionary; does not contain practice-question sentences.
 const extendedEntries='ni hao=你好\nnin hao=您好\nzao shang hao=早上好\nwan shang hao=晚上好\nwan an=晚安\nzai jian=再见\nming tian jian=明天见\nbu ke qi=不客气\nmei guan xi=没关系\ndui bu qi=对不起\nxie xie=谢谢\nqing wen=请问\nqing jin=请进\nqing zuo=请坐\nqing deng yi xia=请等一下\nbu yong xie=不用谢\nmei wen ti=没问题\nhao de=好的\nhao ba=好吧\ndang ran=当然\nke neng=可能\nying gai=应该\nbi xu=必须\nbu yi ding=不一定\nmei you=没有\nyou mei you=有没有\nzen me=怎么\nzen me yang=怎么样\nwei shen me=为什么\nshen me=什么\nshen me shi hou=什么时候\nna li=哪里\nzhe li=这里\nna er=哪儿\nzhe er=这儿\nduo shao=多少\nji ge=几个\nji dian=几点\nduo jiu=多久\nduo yuan=多远\nyi qi=一起\nyi yang=一样\nbu yi yang=不一样\nyi dian er=一点儿\nyi xia=一下\nyi hui er=一会儿\nyi zhi=一直\nyi bian=一边\nyi ding=一定\nyi jing=已经\nyi hou=以后\nyi qian=以前\nzui jin=最近\ngang cai=刚才\nma shang=马上\nxian zai=现在\nzheng zai=正在\nzhun bei=准备\nwan cheng=完成\nji xu=继续\nting zhi=停止\nkai shi=开始\njie shu=结束\nyou shi hou=有时候\njing chang=经常\nchang chang=常常\nou er=偶尔\ncong lai=从来\nzong shi=总是\nmei ci=每次\nmei tian=每天\nmei ge=每个\nmei nian=每年\nmei zhou=每周\nyou dian er=有点儿\nbi jiao=比较\nfei chang=非常\nte bie=特别\nzhen de=真的\nshi zai=实在\nyi ban=一般\ncha bu duo=差不多\nda gai=大概\nda yue=大约\nke shi=可是\ndan shi=但是\nyin wei=因为\nsuo yi=所以\nru guo=如果\nsui ran=虽然\ner qie=而且\nhuo zhe=或者\nhai shi=还是\nran hou=然后\nzui hou=最后\nshou xian=首先\nqi shi=其实\nli ru=例如\nbi ru=比如\nchu le=除了\nguan yu=关于\ndui yu=对于\ngen ju=根据\nan zhao=按照\ntong guo=通过\nni men=你们\nta men=他们\nta men2=她们\nda jia=大家\nbie ren=别人\nzi ji=自己\npeng you=朋友\ntong xue=同学\nlao shi=老师\nxue sheng=学生\ntong shi=同事\nling ju=邻居\nke ren=客人\nfu wu yuan=服务员\nyi sheng=医生\nhu shi=护士\njing li=经理\nlao ban=老板\nsi ji=司机\ngong ren=工人\nzuo jia=作家\nji zhe=记者\nfu mu=父母\nba ba=爸爸\nma ma=妈妈\nge ge=哥哥\ndi di=弟弟\njie jie=姐姐\nmei mei=妹妹\nye ye=爷爷\nnai nai=奶奶\nwai gong=外公\nwai po=外婆\ner zi=儿子\nnv er=女儿\nzhang fu=丈夫\nqi zi=妻子\nhai zi=孩子\nnan ren=男人\nnv ren=女人\nnan peng you=男朋友\nnv peng you=女朋友\nzhong guo ren=中国人\nyue nan=越南\nbei jing=北京\nshang hai=上海\nguang zhou=广州\nshen zhen=深圳\nxiang gang=香港\ntai wan=台湾\nhan guo=韩国\nri ben=日本\nmei guo=美国\nying guo=英国\nfa guo=法国\nde guo=德国\nying yu=英语\nhan yu=汉语\nzhong wen=中文\npu tong hua=普通话\npin yin=拼音\nhan zi=汉字\nci yu=词语\nju zi=句子\nyu fa=语法\nfan yi=翻译\nyi si=意思\nwen ti=问题\nda an=答案\nzuo ye=作业\nkao shi=考试\ncheng ji=成绩\nke ben=课本\nshu bao=书包\nbi ji ben=笔记本\ndian nao=电脑\nshou ji=手机\nping ban=平板\nwang luo=网络\nwang zhan=网站\nruan jian=软件\nyou xi=游戏\ndian ying=电影\ndian shi=电视\nyin yue=音乐\nge qu=歌曲\nzhao pian=照片\nshi pin=视频\nxin wen=新闻\ngu shi=故事\nxiao shuo=小说\nbao zhi=报纸\nda xue=大学\nzhong xue=中学\nxiao xue=小学\njiao shi=教室\ntu shu guan=图书馆\nshi tang=食堂\nban gong shi=办公室\ngong si=公司\ngong chang=工厂\nyi yuan=医院\nyao dian=药店\nyin hang=银行\nyou ju=邮局\nshang dian=商店\nshang chang=商场\nchao shi=超市\nshi chang=市场\ncan ting=餐厅\nfan guan=饭馆\nka fei guan=咖啡馆\ncha guan=茶馆\njiu dian=酒店\nbin guan=宾馆\ngong yuan=公园\ndian ying yuan=电影院\nbo wu guan=博物馆\nhuo che zhan=火车站\nqi che zhan=汽车站\nji chang=机场\ndi tie zhan=地铁站\ngong jiao che zhan=公交车站\nlu kou=路口\njie dao=街道\nma lu=马路\ndi fang=地方\ncheng shi=城市\nguo jia=国家\nfang jian=房间\nke ting=客厅\nwo shi=卧室\nchu fang=厨房\nce suo=厕所\nxi shou jian=洗手间\nmen kou=门口\nchuang hu=窗户\nzhuo zi=桌子\nyi zi=椅子\nchuang=床\ndeng zi=凳子\ndeng=灯\nkong tiao=空调\nbing xiang=冰箱\nxi yi ji=洗衣机\ndian ti=电梯\nming tian=明天\nzuo tian=昨天\nhou tian=后天\nqian tian=前天\nzao shang=早上\nshang wu=上午\nzhong wu=中午\nxia wu=下午\nwan shang=晚上\nban ye=半夜\nshi jian=时间\nshi hou=时候\nxiao shi=小时\nfen zhong=分钟\nmiao zhong=秒钟\nxing qi=星期\nxing qi yi=星期一\nxing qi er=星期二\nxing qi san=星期三\nxing qi si=星期四\nxing qi wu=星期五\nxing qi liu=星期六\nxing qi tian=星期天\nzhou mo=周末\nyue fen=月份\nnian fen=年份\nsheng ri=生日\njie ri=节日\nchun jie=春节\nxin nian=新年\njin nian=今年\nming nian=明年\nqu nian=去年\nshang ge yue=上个月\nxia ge yue=下个月\nshang ge xing qi=上个星期\nyi=一\ner=二\nliang=两\nsan=三\nsi=四\nwu=五\nliu=六\nqi=七\nba=八\njiu=九\nshi=十\nbai=百\nqian=千\nwan=万\nyi bai=一百\nyi qian=一千\nyi wan=一万\ndi yi=第一\ndi er=第二\ndi san=第三\nyi ban=一半\nban ge=半个\nji shi=几十\nduo shao qian=多少钱\nren min bi=人民币\nkuai qian=块钱\nyuan=元\njiao=角\nfen=分\nling qian=零钱\nxian jin=现金\nxin yong ka=信用卡\nzhi fu bao=支付宝\nwei xin=微信\nzhi fu=支付\nfu qian=付钱\nmai dan=买单\njie zhang=结账\nfa piao=发票\nzhe kou=折扣\nda zhe=打折\nte jia=特价\nyou hui=优惠\ngui=贵\npian yi=便宜\njia ge=价格\njia qian=价钱\nzhi liang=质量\nchi cun=尺寸\nda xiao=大小\nyan se=颜色\nkuan shi=款式\nhao ma=号码\nyi fu=衣服\nyi jian=一件\nyi tiao=一条\nyi shuang=一双\nshang yi=上衣\nwai tao=外套\nda yi=大衣\nmao yi=毛衣\nchen shan=衬衫\nku zi=裤子\nniu zai ku=牛仔裤\nduan ku=短裤\nqun zi=裙子\nlian yi qun=连衣裙\nxie zi=鞋子\nyun dong xie=运动鞋\nwa zi=袜子\nmao zi=帽子\nshou tao=手套\nwei jin=围巾\npi dai=皮带\nbao=包\nshou ti bao=手提包\nyan jing=眼镜\nshou biao=手表\nhong se=红色\nlan se=蓝色\nhei se=黑色\nbai se=白色\nhuang se=黄色\nlv se=绿色\nzi se=紫色\nfen hong se=粉红色\nhui se=灰色\nzong se=棕色\nshen se=深色\nqian se=浅色\nhao kan=好看\nhe shi=合适\nshu fu=舒服\ngan jing=干净\npiao liang=漂亮\nshi shang=时尚\nshi yi shi=试一试\nshi chuan=试穿\nshi yi jian=试衣间\nhuan yi ge=换一个\nhuan yi jian=换一件\nke yi=可以\nzao fan=早饭\nwu fan=午饭\nwan fan=晚饭\nmi fan=米饭\nmian tiao=面条\njiao zi=饺子\nbao zi=包子\nman tou=馒头\nji dan=鸡蛋\nniu nai=牛奶\ndou jiang=豆浆\nguo zhi=果汁\nka fei=咖啡\nhong cha=红茶\nlv cha=绿茶\nshui guo=水果\nping guo=苹果\nxiang jiao=香蕉\nju zi=橘子\nxi gua=西瓜\npu tao=葡萄\ncao mei=草莓\nmang guo=芒果\nshu cai=蔬菜\nxi hong shi=西红柿\ntu dou=土豆\nhuang gua=黄瓜\nqing cai=青菜\nrou=肉\nniu rou=牛肉\nzhu rou=猪肉\nji rou=鸡肉\nyang rou=羊肉\nyu rou=鱼肉\nhai xian=海鲜\ntang=汤\nyan=盐\ntang2=糖\nla jiao=辣椒\nla=辣\ntian=甜\nsuan=酸\nku=苦\nxian=咸\nhao chi=好吃\nhao he=好喝\nke le=可乐\nkuang quan shui=矿泉水\nre shui=热水\nlai=来\nhui lai=回来\nchu qu=出去\njin lai=进来\nshang qu=上去\nxia lai=下来\nzou=走\npao=跑\nzuo=坐\nzhan=站\nqi=骑\nkai che=开车\nda che=打车\nzuo che=坐车\ngong gong qi che=公共汽车\ngong jiao che=公交车\ndi tie=地铁\nhuo che=火车\ngao tie=高铁\nfei ji=飞机\nchu zu che=出租车\nzi xing che=自行车\ndian dong che=电动车\nmo tuo che=摩托车\nche piao=车票\nji piao=机票\nhu zhao=护照\nqian zheng=签证\nlv you=旅游\nlv xing=旅行\nchu chai=出差\nchu fa=出发\ndao da=到达\nchi dao=迟到\nmi lu=迷路\ndao lu=道路\nfang xiang=方向\nzuo bian=左边\nyou bian=右边\nqian mian=前面\nhou mian=后面\nshang mian=上面\nxia mian=下面\nli mian=里面\nwai mian=外面\npang bian=旁边\nzhong jian=中间\nfu jin=附近\ndui mian=对面\nyi zhi zou=一直走\nxiang zuo zhuan=向左转\nting jian=听见\nting dong=听懂\nshuo hua=说话\nshuo ming=说明\ngao su=告诉\nhui da=回答\nti wen=提问\nwen hou=问候\njie shao=介绍\nren shi=认识\nliao tian=聊天\nda dian hua=打电话\nfa xiao xi=发消息\nfa you jian=发邮件\nshou dao=收到\nfa xian=发现\nming bai=明白\nli jie=理解\nji de=记得\nwang ji=忘记\nxiang xin=相信\nzhi dao=知道\nren wei=认为\njue de=觉得\nxi wang=希望\ndan xin=担心\nhai pa=害怕\nsheng qi=生气\ngao xing=高兴\nkai xin=开心\nnan guo=难过\nshang xin=伤心\njin zhang=紧张\nfang xin=放心\ngan xie=感谢\nxi huan=喜欢\nai=爱\ntao yan=讨厌\nxu yao=需要\nxiang yao=想要\nda suan=打算\nji hua=计划\njue ding=决定\nxuan ze=选择\ntong yi=同意\nju jue=拒绝\nbang mang=帮忙\nbang zhu=帮助\nzhao gu=照顾\nguan xin=关心\nzhu yi=注意\nbao hu=保护\ncan jia=参加\nju xing=举行\nzu zhi=组织\nfu xi=复习\nyu xi=预习\nlian xi=练习\ndu shu=读书\nkan shu=看书\nxie zi=写字\nxie zuo=写作\nzuo ti=做题\nbei shu=背书\nbei dan ci=背单词\nshang ke=上课\nxia ke=下课\nfang xue=放学\nbi ye=毕业\nliu xue=留学\ngong zuo=工作\nshang ban=上班\nxia ban=下班\njia ban=加班\nxiu xi=休息\nfang jia=放假\nqing jia=请假\nzhao gong zuo=找工作\nying pin=应聘\nmian shi=面试\ngong zi=工资\nshou ru=收入\njing yan=经验\nneng li=能力\nji hui=机会\ncheng gong=成功\nshi bai=失败\nnu li=努力\nren zhen=认真\nzhong yao=重要\njian dan=简单\nfu za=复杂\nrong yi=容易\nkun nan=困难\nyou yong=有用\nyou qu=有趣\nwu liao=无聊\nkuai le=快乐\nxing fu=幸福\njian kang=健康\nsheng bing=生病\ngan mao=感冒\nfa shao=发烧\ntou teng=头疼\ndu zi teng=肚子疼\nkan bing=看病\nchi yao=吃药\nda zhen=打针\nyun dong=运动\npao bu=跑步\nyou yong=游泳\nda qiu=打球\nti zu qiu=踢足球\nda lan qiu=打篮球\nda ping pang qiu=打乒乓球\nsan bu=散步\ntiao wu=跳舞\nchang ge=唱歌\nhua hua=画画\nzuo fan=做饭\nxi zao=洗澡\nshui jiao=睡觉\nqi chuang=起床\nshua ya=刷牙\nxi lian=洗脸\nxi shou=洗手\nda sao=打扫\nxi yi fu=洗衣服\nmai dong xi=买东西\nhuai=坏\nda=大\nxiao=小\nduo=多\nshao=少\ngao=高\nai=矮\nchang=长\nduan=短\nkuai=快\nman=慢\nxin=新\njiu=旧\nre=热\nleng=冷\nnuan he=暖和\nliang kuai=凉快\nqing=轻\nzhong=重\nyuan=远\njin=近\nzao=早\nwan=晚\nmang=忙\nlei=累\ne=饿\nke=渴\npang=胖\nshou=瘦\ncong ming=聪明\nke ai=可爱\nyou hao=友好\nre qing=热情\nan jing=安静\nre nao=热闹\nan quan=安全\nwei xian=危险\nzheng que=正确\ncuo wu=错误\nqing chu=清楚\nmo hu=模糊\nfang bian=方便\nma fan=麻烦\nzi you=自由\nping deng=平等\ngong ping=公平\nte shu=特殊\npu tong=普通\nzhu yao=主要\nqi ta=其他\nbu fen=部分\nquan bu=全部\nda bu fen=大部分\nyi xie=一些\nxu duo=许多\nshi=是\nshi=时\nshi=事\nshi=市\nshi=试\nshi=师\nshi=室\nshi=世\nshi=使\nshi=式\nshi=石\nshi=食\nshi=识\nshi=史\nshi=示\nshi=视\nshi=适\nshi=诗\nshi=失\nshi=湿\nshi=实\nshi=施\nshi=士\nshi=氏\nshi=始\nshi=势\nshi=饰\nshi=拾\nshi=释\nyi=衣\nyi=医\nyi=依\nyi=意\nyi=以\nyi=已\nyi=易\nyi=义\nyi=艺\nyi=亿\nyi=椅\nyi=议\nyi=亦\nyi=益\nyi=异\nyi=移\nyi=疑\nyi=遗\nyi=宜\nyi=仪\nyi=翼\nyi=译\nyi=忆\nyi=乙\nyi=疫\nyi=抑\nyi=毅\nma=吗\nma=妈\nma=马\nma=麻\nma=码\nma=骂\nma=蚂\nmai=买\nmai=卖\nmai=麦\nmai=迈\nmai=脉\nmai=埋\nwo=我\nwo=握\nwo=窝\nwo=卧\nwo=沃\nni=你\nni=泥\nni=拟\nni=逆\nni=妮\nhao=好\nhao=号\nhao=毫\nhao=豪\nhao=浩\nhao=耗\nhao=郝\nfu=服\nfu=福\nfu=付\nfu=父\nfu=夫\nfu=复\nfu=副\nfu=富\nfu=府\nfu=扶\nfu=符\nfu=负\nfu=浮\nfu=幅\nfu=腐\nfu=辅\nfu=妇\nfu=伏\nfu=覆\njian=件\njian=见\njian=建\njian=间\njian=简\njian=检\njian=剑\njian=健\njian=坚\njian=减\njian=捡\njian=肩\njian=尖\njian=监\njian=兼\njian=渐\njian=箭\njian=艰\nzhe=这\nzhe=着\nzhe=者\nzhe=折\nzhe=遮\nzhe=哲\nzhe=浙\nge=个\nge=各\nge=歌\nge=哥\nge=格\nge=隔\nge=革\nge=阁\nge=葛\nhe=喝\nhe=和\nhe=河\nhe=合\nhe=何\nhe=盒\nhe=贺\nhe=核\nhe=荷\nhe=鹤\nshui=水\nshui=谁\nshui=睡\nshui=税\nxiang=想\nxiang=向\nxiang=像\nxiang=象\nxiang=香\nxiang=乡\nxiang=相\nxiang=箱\nxiang=项\nxiang=享\nxiang=响\nxiang=详\nxiang=湘\nxiang=巷\nyao=要\nyao=药\nyao=摇\nyao=咬\nyao=腰\nyao=遥\nyao=邀\nyao=耀\nyao=姚\nzai=在\nzai=再\nzai=载\nzai=灾\nzai=栽\nzai=宰\nna=那\nna=哪\nna=拿\nna=纳\nna=娜\nbu=不\nbu=步\nbu=部\nbu=布\nbu=补\nbu=捕\nbu=怖\nbu=卜\nle=了\nle=乐\nle=勒\nli=里\nli=理\nli=力\nli=利\nli=立\nli=李\nli=离\nli=礼\nli=历\nli=丽\nli=例\nli=旅\nli=粒\nli=黎\nli=梨\nli=励\nliang=量\nliang=亮\nliang=良\nliang=凉\nliang=梁\nliang=辆\nliang=谅\nliang=粮\nxue=学\nxue=雪\nxue=血\nxue=穴\nsheng=生\nsheng=声\nsheng=省\nsheng=胜\nsheng=升\nsheng=圣\nsheng=剩\nsheng=绳\nsheng=盛\nqing=请\nqing=情\nqing=清\nqing=青\nqing=庆\nqing=晴\nqing=倾\nqian=钱\nqian=前\nqian=签\nqian=浅\nqian=欠\nqian=牵\nqian=遣\nqian=潜\nqian=谦\nzhi=知\nzhi=只\nzhi=之\nzhi=直\nzhi=值\nzhi=指\nzhi=纸\nzhi=治\nzhi=制\nzhi=质\nzhi=支\nzhi=职\nzhi=志\nzhi=至\nzhi=智\nzhi=置\nzhi=止\nzhi=致\nzhi=织\nzhi=枝\nzhong=中\nzhong=种\nzhong=众\nzhong=终\nzhong=钟\nzhong=忠\nzhong=肿\nzhong=衷\nwen=问\nwen=文\nwen=闻\nwen=温\nwen=稳\nwen=吻\nwen=纹\nkan=看\nkan=刊\nkan=砍\nkan=堪\nxie=写\nxie=谢\nxie=鞋\nxie=些\nxie=血\nxie=卸\nxie=协\nxie=斜\nxie=邪\nxie=泄\nxie=携\nshuo=说\nshuo=硕\nshuo=朔\nzuo=做\nzuo=左\nzuo=作\nzuo=昨\nzuo=座\nxing=行\nxing=星\nxing=性\nxing=姓\nxing=形\nxing=兴\nxing=型\nxing=醒\nxing=幸\nxing=刑\nhang=行\nhang=航\nhang=杭\nhang=巷\nchang=常\nchang=场\nchang=唱\nchang=厂\nchang=尝\nchang=昌\nchang=肠\nchang=畅\nzhang=张\nzhang=长\nzhang=章\nzhang=掌\nzhang=涨\nzhang=丈\nzhang=帐\nzhang=账\nzhang=障\nhui=会\nhui=回\nhui=灰\nhui=汇\nhui=挥\nhui=辉\nhui=惠\nhui=绘\nhui=毁\nhui=悔\nren=人\nren=认\nren=任\nren=仁\nren=忍\nren=刃\nxin=心\nxin=信\nxin=辛\nxin=欣\nxin=薪\nxin=芯\nxian=先\nxian=现\nxian=线\nxian=县\nxian=限\nxian=显\nxian=鲜\nxian=险\nxian=闲\nxian=仙\nxian=献\nzhen=真\nzhen=针\nzhen=镇\nzhen=阵\nzhen=震\nzhen=珍\nzhen=振\nzhen=诊\nzheng=正\nzheng=整\nzheng=证\nzheng=政\nzheng=争\nzheng=征\nzheng=症\nzheng=郑\nman=满\nman=漫\nman=蛮\nman=瞒\nkuai=块\nkuai=筷\nke=可\nke=课\nke=客\nke=科\nke=克\nke=刻\nke=颗\nke=棵\nke=壳\ncha=茶\ncha=查\ncha=差\ncha=插\ncha=叉\ncha=察\nchuan=穿\nchuan=船\nchuan=传\nchuan=串\nchuan=川\nchi=吃\nchi=迟\nchi=持\nchi=池\nchi=尺\nchi=赤\nchi=翅\nchi=齿\nchu=出\nchu=处\nchu=初\nchu=除\nchu=厨\nchu=储\nchu=触\nchu=楚\nhuan=换\nhuan=还\nhuan=环\nhuan=欢\nhuan=缓\nhuan=患\nhuan=幻\nhuo=或\nhuo=活\nhuo=火\nhuo=货\nhuo=获\nhuo=伙\nhua=话\nhua=花\nhua=化\nhua=画\nhua=华\nhua=划\nhua=滑\nji=几\nji=机\nji=记\nji=级\nji=急\nji=计\nji=鸡\nji=集\nji=极\nji=即\nji=及\nji=季\nji=寄\nji=技\nji=继\nji=激\nji=基\nji=积\njie=接\njie=街\njie=节\njie=解\njie=借\njie=姐\njie=界\njie=结\njie=介\njie=戒\njie=杰\njie=洁\njiao=叫\njiao=教\njiao=交\njiao=脚\njiao=较\njiao=胶\njiao=饺\njiao=焦\njiao=郊\njia=家\njia=加\njia=价\njia=假\njia=架\njia=甲\njia=佳\njia=嘉\njia=嫁\nju=句\nju=局\nju=举\nju=居\nju=具\nju=剧\nju=巨\nju=聚\nju=拒\njué=觉\njué=决\njué=绝\njué=角\njué=掘\njue=觉\njue=决\njue=绝\njue=角\njue=掘\nlou=楼\nlou=漏\nlou=露\nlou=搂\nlu=路\nlu=录\nlu=陆\nlu=鹿\nlu=露\nlu=炉\nlu=绿\nlv=绿\nlv=旅\nlv=律\nlv=虑\nlv=吕\nlv=铝\nnv=女\nnv=钕\nnü=女\nnü=钕\nqu=去\nqu=取\nqu=区\nqu=曲\nqu=趣\nqu=渠\nqu=驱\nqi=起\nqi=气\nqi=期\nqi=其\nqi=奇\nqi=妻\nqi=旗\nqi=齐\nqi=弃\nqiu=球\nqiu=求\nqiu=秋\nqiu=丘\nqiu=囚\nran=然\nran=燃\nran=染\nrang=让\nrang=嚷\nrang=壤\nru=如\nru=入\nru=乳\nsan=散\nsan=伞\nshang=上\nshang=商\nshang=伤\nshang=尚\nshang=赏\nshao=烧\nshao=勺\nshao=绍\nshao=哨\nshe=社\nshe=设\nshe=舍\nshe=射\nshe=蛇\nshen=身\nshen=深\nshen=神\nshen=什\nshen=审\nshen=伸\nshen=甚\nshou=手\nshou=收\nshou=首\nshou=受\nshou=售\nshou=守\nshou=寿\nshu=书\nshu=树\nshu=数\nshu=输\nshu=熟\nshu=属\nshu=叔\nshu=舒\nshu=鼠\nsu=苏\nsu=速\nsu=素\nsu=诉\nsu=俗\nsu=宿\nsuan=算\nsuan=蒜\nsui=岁\nsui=随\nsui=虽\nsui=碎\nsui=穗\nsun=孙\nsun=损\nsun=笋\nsuo=所\nsuo=索\nsuo=锁\nsuo=缩\nta=他\nta=她\nta=它\nta=塔\nta=踏\ntai=太\ntai=台\ntai=态\ntai=抬\ntai=泰\ntan=谈\ntan=弹\ntan=坦\ntan=探\ntan=碳\ntang=糖\ntang=堂\ntang=躺\ntang=唐\ntang=塘\ntian=天\ntian=田\ntian=填\ntian=添\nting=听\nting=停\nting=庭\nting=挺\nting=厅\ntong=同\ntong=通\ntong=痛\ntong=童\ntong=统\ntong=桶\ntong=铜\ntou=头\ntou=投\ntou=偷\ntou=透\ntu=图\ntu=土\ntu=兔\ntu=途\ntu=涂\nwan=完\nwan=玩\nwan=碗\nwan=弯\nwang=王\nwang=往\nwang=网\nwang=忘\nwang=望\nwang=汪\nwei=为\nwei=位\nwei=味\nwei=未\nwei=伟\nwei=维\nwei=围\nwei=卫\nwei=微\nwei=胃\nwei=委\nwu=无\nwu=物\nwu=午\nwu=舞\nwu=武\nwu=误\nwu=屋\nwu=污\nxi=西\nxi=洗\nxi=喜\nxi=习\nxi=戏\nxi=细\nxi=席\nxi=希\nxi=系\nxi=吸\nxi=溪\nxia=下\nxia=夏\nxia=吓\nxia=虾\nxia=狭\nxiao=笑\nxiao=校\nxiao=消\nxiao=晓\nxiao=效\nxiao=销\nxiao=孝\nxu=需\nxu=许\nxu=须\nxu=续\nxu=序\nxu=虚\nxu=徐\nya=呀\nya=牙\nya=鸭\nya=亚\nya=压\nya=雅\nyan=眼\nyan=言\nyan=研\nyan=颜\nyan=演\nyan=严\nyan=烟\nyan=验\nyan=沿\nyang=样\nyang=养\nyang=羊\nyang=阳\nyang=洋\nyang=杨\nyang=扬\nye=也\nye=夜\nye=页\nye=业\nye=叶\nye=野\nye=爷\nyin=因\nyin=音\nyin=银\nyin=阴\nyin=引\nyin=印\nyin=饮\nyin=隐\nying=应\nying=英\nying=影\nying=赢\nying=营\nying=迎\nying=硬\nyong=用\nyong=永\nyong=勇\nyong=拥\nyong=涌\nyou=有\nyou=又\nyou=右\nyou=友\nyou=油\nyou=游\nyou=优\nyou=由\nyou=邮\nyou=幼\nyu=鱼\nyu=语\nyu=雨\nyu=玉\nyu=遇\nyu=于\nyu=与\nyu=育\nyu=预\nyu=余\nyuan=原\nyuan=员\nyuan=园\nyuan=圆\nyuan=愿\nyuan=院\nyuan=源\nyue=月\nyue=越\nyue=约\nyue=阅\nyue=乐\nyue=跃\nyun=云\nyun=运\nyun=允\nyun=晕\nyun=孕\nzao=造\nzao=糟\nzao=澡\nzao=枣\nzen=怎\nzhan=战\nzhan=展\nzhan=占\nzhan=沾\nzhao=找\nzhao=照\nzhao=赵\nzhao=招\nzhao=朝\nzhao=罩\nzhou=周\nzhou=州\nzhou=粥\nzhou=舟\nzhou=皱\nzhou=轴\nzhu=住\nzhu=主\nzhu=猪\nzhu=祝\nzhu=注\nzhu=竹\nzhu=煮\nzhu=助\nzhuang=装\nzhuang=状\nzhuang=庄\nzhuang=壮\nzhuang=撞\nzi=字\nzi=子\nzi=自\nzi=资\nzi=紫\nzi=仔\nzi=姿\nzou=奏\nzou=揍\nzui=最\nzui=嘴\nzui=醉\nzui=罪\nzun=尊\nzun=遵'.split('\n');
 for(const line of extendedEntries){const at=line.indexOf('=');if(at>0)add(line.slice(0,at),line.slice(at+1));}
 // Learn only explicit candidate selections, locally on this device.
 const PREF_KEY='cc_ime_candidate_preferences_v2';
 let preferences={};try{preferences=JSON.parse(localStorage.getItem(PREF_KEY)||'{}')||{}}catch(e){}
 function rank(key,values){const fav=preferences[key]||{};return [...values].sort((a,b)=>(fav[b]||0)-(fav[a]||0));}
 function remember(key,value){if(!key||!value)return;const group=preferences[key]||(preferences[key]={});group[value]=Math.min(999,(group[value]||0)+1);try{localStorage.setItem(PREF_KEY,JSON.stringify(preferences))}catch(e){}}

 function tokenize(text){
  const words=norm(text).split(' ').filter(Boolean),parts=[];
  // Dictionary-derived valid syllables for continuous Pinyin (e.g. nihao).
  function splitJoined(word){
   if(dictionary.has(word))return [word];
   if(!/^[a-zv]+$/.test(word)||word.length>48)return [word];
   const dp=Array(word.length+1).fill(null);dp[word.length]=[];
   for(let i=word.length-1;i>=0;i--){
    let best=null,bestScore=-Infinity;
    for(let j=i+1;j<=Math.min(word.length,i+12);j++){
     const k=word.slice(i,j);if(!dictionary.has(k)||!dp[j])continue;
     const score=(k.length>=3?3:1)+k.length*.12-dp[j].length*.9;
     if(score>bestScore){bestScore=score;best=[k,...dp[j]];}
    }
    dp[i]=best;
   }
   return dp[0]||[word];
  }
  // First preserve exact multiword phrases; then split remaining joined Pinyin.
  for(let i=0;i<words.length;){
   let found=null;
   for(let len=Math.min(7,words.length-i);len>1;len--){
    const key=words.slice(i,i+len).join(' ');
    if(dictionary.has(key)){found={key,values:rank(key,dictionary.get(key)),len};break;}
   }
   if(found){parts.push(found);i+=found.len;continue;}
   for(const key of splitJoined(words[i]))parts.push({key,values:rank(key,dictionary.get(key)||[]),len:1});
   i++;
  }
  return parts;
 }
function convert(text){
 const parts=tokenize(text),unknown=parts.filter(p=>!p.values.length).map(p=>p.key);
 const exact=rank(norm(text),dictionary.get(norm(text))||[]);
 return {value:parts.map(p=>p.values[0]||p.key).join(''),unknown,choices:exact.slice(0,40),parts};
}
function attach(panel,field){
 const box=document.createElement('div');box.className='cc-ime';
 const label=document.createElement('label');label.textContent='⌨️ Bộ gõ Pinyin → chữ Hán (offline)';
 const input=document.createElement('input');input.type='text';input.autocomplete='off';input.spellcheck=false;
 input.placeholder='Ví dụ: wo mai yi fu';input.setAttribute('aria-label','Nhập Pinyin không dấu');
 const preview=document.createElement('div');preview.className='cc-ime-preview';preview.setAttribute('aria-live','polite');
 const segments=document.createElement('div');segments.className='cc-ime-segments';
 const choices=document.createElement('div');choices.className='cc-ime-suggestions';
 const controls=document.createElement('div');controls.className='cc-ime-controls';
 const insert=document.createElement('button');insert.type='button';insert.textContent='Chèn chữ Hán vào bài viết';
 const erase=document.createElement('button');erase.type='button';erase.className='secondary';erase.textContent='Xóa Pinyin';
 const note=document.createElement('p');note.className='cc-ime-note';
 note.textContent='Chọn từng từ bên dưới để xem nhiều chữ đồng âm. Bấm 1–9 để chọn gợi ý; PageDown/PageUp để đổi trang; ←/→ để đổi từ. Bộ gõ không tự hiển thị đáp án bài tập.';
 const style=document.createElement('style');style.textContent=`
 .cc-ime-segments{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0}
 .cc-ime-segments button{padding:7px 12px;border-radius:8px;border:1px solid #9bbce5;background:#fff;color:#164c87;cursor:pointer}
 .cc-ime-segments button[aria-pressed="true"]{background:#155eb0;color:#fff}
 .cc-ime-suggestions{display:flex;flex-wrap:wrap;gap:7px;margin:8px 0}
 .cc-ime-suggestions button{padding:8px 12px;border:1px solid #9bbce5;border-radius:8px;background:#fff;color:#124d92;cursor:pointer}
 .cc-ime-suggestions button[aria-pressed="true"]{background:#1769c2;color:#fff}
 .cc-ime-note{font-size:.87em}
 `;box.append(style);
 let parts=[],selected=[],active=0,page=0;
 function show(){
  preview.textContent=parts.length?parts.map((p,i)=>selected[i]||p.key).join(''):'Chữ Hán sẽ xuất hiện tại đây';
  segments.replaceChildren();choices.replaceChildren();
  parts.forEach((p,i)=>{
   const b=document.createElement('button');b.type='button';b.textContent=`${p.key} → ${selected[i]||'?'}`;
   b.setAttribute('aria-pressed',String(i===active));b.onclick=()=>{active=i;page=0;show()};segments.append(b);
  });
  const p=parts[active];
  if(p&&p.values.length){
   const pages=Math.ceil(p.values.length/9);
   if(page>=pages)page=0;
   p.values.slice(page*9,(page+1)*9).forEach((value,i)=>{
    const b=document.createElement('button');b.type='button';b.textContent=`${i+1}. ${value}`;
    b.setAttribute('aria-pressed',String(selected[active]===value));
    b.onclick=()=>{selected[active]=value;remember(p.key,value);show()};choices.append(b);
   });
   if(pages>1){
    const prev=document.createElement('button');prev.type='button';prev.textContent='‹ Trang trước';prev.disabled=page===0;prev.onclick=()=>{page--;show()};choices.append(prev);
    const info=document.createElement('span');info.textContent=`Trang ${page+1}/${pages}`;choices.append(info);
    const next=document.createElement('button');next.type='button';next.textContent='Trang sau ›';next.disabled=page===pages-1;next.onclick=()=>{page++;show()};choices.append(next);
   }
  }else if(p){const msg=document.createElement('span');msg.textContent='Chưa có chữ Hán cho âm tiết này.';choices.append(msg)}
  insert.disabled=!parts.length||parts.some(p=>!p.values.length);
 }
 function update(){parts=tokenize(input.value);selected=parts.map(p=>p.values[0]||'');active=Math.min(active,Math.max(0,parts.length-1));page=0;show()}
 input.addEventListener('input',()=>{active=0;update()});
 input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();insert.click()}
  else if(e.key==='PageDown'&&parts[active]?.values.length>(page+1)*9){e.preventDefault();page++;show()}
  else if(e.key==='PageUp'&&page>0){e.preventDefault();page--;show()}
  else if(e.key==='ArrowRight'&&active<parts.length-1){e.preventDefault();active++;page=0;show()}
  else if(e.key==='ArrowLeft'&&active>0){e.preventDefault();active--;page=0;show()}
  else if(/^[1-9]$/.test(e.key)&&parts[active]?.values[page*9+Number(e.key)-1]){
   e.preventDefault();selected[active]=parts[active].values[page*9+Number(e.key)-1];remember(parts[active].key,selected[active]);
   if(active<parts.length-1)active++;page=0;show();
  }
 });
 insert.onclick=()=>{
  if(insert.disabled)return;const value=selected.join('');if(!value)return;
  const a=field.selectionStart??field.value.length,b=field.selectionEnd??a;
  field.setRangeText(value,a,b,'end');field.dispatchEvent(new Event('input',{bubbles:true}));
  input.value='';active=0;update();field.focus();
 };
 erase.onclick=()=>{input.value='';active=0;update();input.focus()};
 controls.append(insert,erase);box.append(label,input,preview,segments,choices,controls,note);panel.append(box);update();
}
window.CCPinyinIME={attach,convert};
})();
