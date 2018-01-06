import MaisWindow from "./window";
import { configure } from "./window";
import jQuery from "jquery";

(function($) {

    $(document).ready(() => {

        configure({
            "close": `<li class="window_action" role="close-action" title="Закрыть навсегда"><span>x</span></li>`
        });

        const wnd = new MaisWindow({
            title: "Awesome Modal Window",
            content: `<div>
                        <span>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolorum reprehenderit suscipit quibusdam voluptatibus quisquam ad quas, eius aliquam dolorem porro cupiditate, nostrum voluptate commodi, quos esse amet aperiam eos minus.</span>
                      </div>`,
            actions: [ "close" ]
        });
        wnd.init();

    });

})(jQuery);