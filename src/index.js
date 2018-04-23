import Timeline from "./timeline";
import TimelineComponent from "./timeline-component";
import TimelineContainer from "./timeline-container";
import { assign } from "./util";

export default {
    /*
  * install function
  * @param  {Vue} Vue
  * @param  {object} options  lazyload options
  */
    install(Vue, options = {}) {
        const timelineClass = Timeline(Vue);
        const lazy = new timelineClass(options);
        const timelineContainer = new TimelineContainer({ lazy });

        const isVue2 = Vue.version.split(".")[0] === "2";

        Vue.prototype.$Lazyload = lazy;

        if (options.lazyComponent) {
            Vue.component("timeline-component", TimelineComponent(lazy));
        }

        if (isVue2) {
            Vue.directive("lazy", {
                bind: lazy.add.bind(lazy),
                update: lazy.update.bind(lazy),
                componentUpdated: lazy.lazyLoadHandler.bind(lazy),
                unbind: lazy.remove.bind(lazy)
            });
            Vue.directive("timeline-container", {
                bind: timelineContainer.bind.bind(timelineContainer),
                update: timelineContainer.update.bind(timelineContainer),
                unbind: timelineContainer.unbind.bind(timelineContainer)
            });
        } else {
            Vue.directive("lazy", {
                bind: lazy.lazyLoadHandler.bind(lazy),
                update(newValue, oldValue) {
                    assign(this.vm.$refs, this.vm.$els);
                    lazy.add(
                        this.el,
                        {
                            modifiers: this.modifiers || {},
                            arg: this.arg,
                            value: newValue,
                            oldValue: oldValue
                        },
                        { context: this.vm }
                    );
                },
                unbind() {
                    lazy.remove(this.el);
                }
            });

            Vue.directive("lazy-container", {
                update(newValue, oldValue) {
                    timelineContainer.update(
                        this.el,
                        {
                            modifiers: this.modifiers || {},
                            arg: this.arg,
                            value: newValue,
                            oldValue: oldValue
                        },
                        { context: this.vm }
                    );
                },
                unbind() {
                    timelineContainer.unbind(this.el);
                }
            });
        }
    }
};
