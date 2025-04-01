<?php
$lang->cmd_denied_ip = '스팸 IP 목록';
$lang->cmd_denied_word = '스팸 키워드 목록';
$lang->cmd_config_block = '자동 차단 설정';
$lang->cmd_captcha_config = '캡챠 설정';
$lang->add_denied_ip = '스팸 IP 추가';
$lang->add_denied_word = '스팸 키워드 추가';
$lang->spamfilter = '스팸필터';
$lang->denied_ip = '금지 IP';
$lang->interval = '스팸 처리 간격';
$lang->limit_count = '제한 수';
$lang->check_trackback = '트랙백 검사';
$lang->word = '키워드';
$lang->hit = '히트';
$lang->latest_hit = '최근 히트';
$lang->custom_message = '차단 메시지 설정';
$lang->enable_description = '# 뒷부분은 설명으로 입력';
$lang->about_custom_message = '스팸 키워드 발견시 표시할 에러 메시지를 지정할 수 있습니다.<br>%s를 넣으면 그 자리에 해당 키워드를 표시하고, 그렇지 않으면 키워드를 숨깁니다.';
$lang->about_interval = '지정된 시간 내에 글을 등록하지 못하게 합니다.';
$lang->about_denied_ip = '한 줄에 하나씩 IP 주소 또는 대역을 입력하세요. &quot;//&quot; 또는 &quot;#&quot; 뒷부분은 설명으로 저장됩니다.<br>예: 127.0.0.1 // 설명, 127.0.0.1 #설명<br>IP 대역 표기법은 <a href="https://github.com/rhymix/rhymix-docs/blob/master/ko/misc/ipfilter.md" target="_blank">매뉴얼</a>을 참고하십시오.';
$lang->about_denied_word = '한 줄에 하나씩 스팸 키워드(2~180자)를 입력하세요. &quot;#&quot; 뒷부분은 설명으로 입력됩니다. &quot;#&quot;을 포함하는 키워드를 차단하려면 위의 설정을 해제하세요.<br>/스팸(키+|워드)?/ 와 같은 형태로 입력하면 정규식으로 간주하며, 올바른 정규식 문법을 사용해야 합니다.<br>대소문자는 구분하지 않습니다.';
$lang->msg_alert_limited_by_config = '%d초 이내에 연속 글 작성은 금지됩니다. 계속 시도하면 IP가 차단될 수 있습니다.';
$lang->msg_alert_limited_message_by_config = '%d초 이내에 연속 쪽지 발송은 금지됩니다. 계속 시도하면 IP가 차단될 수 있습니다.';
$lang->msg_alert_denied_word = '"%s"은(는) 사용이 금지된 단어입니다.';
$lang->msg_alert_registered_denied_ip = 'IP가 차단되었습니다. 사이트 관리자에게 문의 바랍니다.';
$lang->msg_alert_trackback_denied = '한 글에는 하나의 트랙백만 허용됩니다.';
$lang->cmd_spamfilter_except_member = '회원 제외';
$lang->cmd_spamfilter_filter_html = 'HTML';
$lang->cmd_spamfilter_is_regexp = '정규식';
$lang->cmd_interval = '단시간 다수 작성 차단';
$lang->cmd_interval_help = '지정한 시간 내에 다수의 글이나 댓글을 작성하면 스패머로 간주하고 IP를 차단합니다.';
$lang->cmd_blocked_actions = '차단할 행동';
$lang->cmd_blocked_actions_help = '차단된 IP에서는 위의 행동들을 할 수 없게 됩니다.';
$lang->cmd_check_trackback = '트랙백 스팸 차단';
$lang->cmd_check_trackback_help = '하나의 글에 2회 이상 엮인글을 등록하면 스패머로 간주하고 엮인글을 차단합니다.<br>트랙백 모듈이 설치되어 있는 경우에만 적용됩니다.';
$lang->cmd_limits_interval = '글, 댓글 제한 시간';
$lang->cmd_limits_interval_help = '지정한 시간 내에 아래의 갯수만큼 글이나 댓글을 작성하면 스패머로 간주합니다.';
$lang->cmd_limits_count = '글, 댓글 작성 갯수';
$lang->cmd_limits_count_help = '위에서 지정한 시간 내에 이 갯수만큼 글이나 댓글을 작성하면 스패머로 간주합니다.';
$lang->cmd_ipv4_block_range = 'IPv4 차단 범위';
$lang->cmd_ipv6_block_range = 'IPv6 차단 범위';
$lang->cmd_block_range_self = '해당 IP만 차단';
$lang->cmd_block_range_help = '스패머 발견시 비슷한 대역의 IP를 한꺼번에 차단할 수 있습니다. 숫자가 작을수록 광범위하게 차단됩니다.<br>지나치게 광범위하게 차단하면 정상적인 사용자에게 피해가 발생할 수 있으니 주의하시기 바랍니다.';
$lang->cmd_block_range = '마지막 %d자리가 같은 IP를 모두 차단';
$lang->cmd_spamfilter_except_ip = '예외 IP';
$lang->cmd_spamfilter_except_ip_help = '차단하지 않을 IP 또는 IP 대역을 한 줄에 하나씩 입력하십시오.<br>예: 123.45.67.89, 123.45.67.0/24, 123.45.67.*';
$lang->unit_write_count = '회';
$lang->add = '추가';
$lang->msg_duplicate = '이미 존재합니다.';
$lang->msg_invalid_ip = 'IP 주소 형식이 올바르지 않습니다.';
$lang->msg_invalid_word = '스팸 키워드는 2~180자 사이여야 합니다.';
$lang->msg_faillist = '<br />실패 (이미 차단되어 있습니다)<br /> %s ';
$lang->use_captcha = '캡챠 사용';
$lang->about_captcha_position = '로그인 폼, 글쓰기 폼 등의 스킨에서 캡챠를 표시할 위치에 <code>{$captcha}</code> 코드가 들어 있어야 합니다.<br />코드가 없는 경우 임의의 위치에 캡챠가 삽입되므로 디자인이 틀어질 수 있습니다.';
$lang->recaptcha_theme = '색상 테마';
$lang->recaptcha_theme_auto = '자동';
$lang->recaptcha_theme_light = '밝은 색상';
$lang->recaptcha_theme_dark = '어두운 색상';
$lang->recaptcha_size = '캡챠 크기';
$lang->recaptcha_size_normal = '일반';
$lang->recaptcha_size_compact = '작게';
$lang->recaptcha_target_devices = '적용 대상 기기';
$lang->recaptcha_target_actions = '적용 대상 액션';
$lang->recaptcha_target_document = '글 쓰기';
$lang->recaptcha_target_comment = '댓글 쓰기';
$lang->recaptcha_target_users = '적용 대상 유저';
$lang->recaptcha_target_guest = '비회원만';
$lang->recaptcha_target_everyone = '모든 사용자';
$lang->recaptcha_target_frequency = '캡챠 사용 빈도';
$lang->recaptcha_target_first_time_only = '최초 1회만 사용';
$lang->recaptcha_target_every_time = '매번 사용';
$lang->msg_recaptcha_connection_error = '스팸방지 CAPTCHA 서버에 접속하는 도중 오류가 발생했습니다.';
$lang->msg_recaptcha_server_error = '스팸방지 CAPTCHA 서버와 통신하는 도중 오류가 발생했습니다.';
$lang->msg_recaptcha_invalid_response = '스팸방지 기능을 체크해 주십시오.';
$lang->msg_recaptcha_keys_not_set = 'CAPTCHA Site Key 및 Secret Key를 입력하여 주십시오.';
