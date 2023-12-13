<template>
    <div class="search-time-wrapper">
        <bk-popover
            width="400"
            trigger="click"
            placement="bottom"
            theme="light"
            ref="searchTimePopover"
            :on-show="showPopover"
        >
            <div class="time-selector" :style="{ width: `${width}px` }">
                <div class="selector-begintime">
                    <span class="label">从：</span>
                    <span class="value">{{ timerange.from }}</span>
                </div>
                <div class="selector-endtime">
                    <span class="label">到：</span>
                    <span class="value">{{timerange.to || '现在'}}</span>
                </div>
            </div>
            <div slot="content">
                <div class="model-content">
                    <menu-tab
                        class="tap"
                        :panels="panels"
                        :hide-arrow="true"
                        :active-panel="active"
                        type="line"
                        @click="toTabMenu"
                    >
                    </menu-tab>
                    <div v-if="active === 'relative'" class="relative-time">
                        <div class="relative-time-title"><span>{{displayTime.at()}}</span> ~ <span>{{displayTime.at(-1)}}</span></div>
                        <ul class="relative-time-list">
                            <li v-for="(item, index) in relativeTimeTags" :key="item.name"
                                @mouseenter="handleMouseenter(item)"
                                @mouseleave="handleMouseleave"
                                @click="selectRelativeTime(item, index)" :class="[index === activeIndex && 'active']">
                                {{ item.name }}
                            </li>
                        </ul>
                        <div class="relative-time-selector" v-if="showCustomTimeModal">
                            <bk-input
                                class="selector-value"
                                type="number"
                                :min="1"
                                :precision="0"
                                v-model="customTime"
                                @blur="handleBur">
                            </bk-input>
                            <bk-select
                                class="selector-unit mr10"
                                v-model="customUnit"
                                style="width: 100px;"
                                :clearable="false"
                                :popover-options="{ appendTo: 'parent' }"
                                @change="handleChange">
                                <bk-option v-for="option in unitList" :key="option.id" :id="option.id" :name="option.name">
                                </bk-option>
                            </bk-select>
                            <bk-button theme="primary" class="mr10" :disabled="!customTime" @click="confirm('confirmCustomTime')">
                                确认
                            </bk-button>
                        </div>
                    </div>
                    <div v-else>
                        <div class="absolute-time">
                            <bk-date-picker
                                :ext-popover-cls="absoluteTimePopoverLeft ? 'log-picker-popover' : ''"
                                v-model="absoluteTime"
                                :placeholder="'选择日期时间范围'"
                                :type="'datetimerange'"
                                :footer-slot-cls="'log-custom-footer'">
                                <div slot="footer" class="custom-footer">
                                    <bk-button style="color: #979ba5;" text class="mr10" @click="clearAbsoluteTime">
                                        清除
                                    </bk-button>
                                    <bk-button text :disabled="!absoluteTime[0]" @click="confirmSelectAbsoluteTime">
                                        确定
                                    </bk-button>
                                </div>
                            </bk-date-picker>
                        </div>
                    </div>
                </div>
            </div>
        </bk-popover>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'
    import MenuTab from '@/components/menuTab.vue'
    import { getMinutesAgoToNow, getTodayToNow, getCurrentWeekToNow, getFirstDayToNow } from '@log/controller/formatTime'
    import moment from 'moment'

@Component({
    components: {
        MenuTab
    }
})
export default class LogTimeSelector extends Vue {
    @Prop({
        type: Object,
        default: () => {
            return {
                type: 'relative',
                minutes: 900
            }
        }
    })
    defaultTime: any | undefined // 组件的默认值
    @Prop({
        type: Number,
        default: () => 350
    })
    width: number
    @Prop({ type: Boolean, default: () => false }) absoluteTimePopoverLeft: boolean

    panels = [
        { name: 'relative', label: '相对时间' },
        { name: 'absolute', label: '绝对时间' }
    ]
    active: string = 'relative'
    absoluteTime: Array<any> = []
    relativeTimeTags: Array<any> = [
        { name: '以前', type: 'before' },
        { name: '1分钟', type: 'minute', num: 1 },
        { name: '5分钟', type: 'minute', num: 5 },
        { name: '15分钟', type: 'minute', num: 15 },
        { name: '1小时', type: 'minute', num: 60 },
        { name: '4小时', type: 'minute', num: 240 },
        { name: '1天', type: 'minute', num: 1440 },
        // { name: '今天', type: 'today' },
        { name: '1周', type: 'minute', num: 10080 },
        // { name: '15天', type: 'minute', num: 21600 },
        // { name: '本周', type: 'week' },
        { name: '30天', type: 'minute', num: 43200 },
        { name: '60天', type: 'minute', num: 86400 },
        { name: '90天', type: 'minute', num: 129600 },
        // { name: '本月', type: 'month' },
        { name: '自定义', type: 'custom' }
    ]
    customTime: number = 1
    unitList: Array<any> = [
        { name: '天', id: 'day' },
        { name: '小时', id: 'hour' },
        { name: '分钟', id: 'minute' },
        { name: '秒', id: 'second' }
    ]
    customUnit: string = 'day'
    activeTag: any = {}
    activeIndex: number = 3
    displayTime: Array<any> = []
    selectedTime: Array<any> = []
    timerange: any = {
        minutes: 900,
        from: '15分钟',
        type: 'relative'
    }
    timeInfo: any = {}

    get showCustomTimeModal() {
        return this.activeTag.name === '自定义'
    }

    mounted() {
        this.setDefaultTime(this.defaultTime)
    }

    clearAbsoluteTime() {
        this.absoluteTime = []
        this.switchDate()
    }
    confirmSelectAbsoluteTime() {
        this.confirm()
        this.switchDate()
    }
    switchDate() {
        const dom = document.querySelector('.bk-picker-confirm-time')
        if (dom?.innerHTML === '选择日期') {
            dom.click()
        }
    }
    // 设置回显时间段
    setDefaultTime(val) {
        const minutes = val.minutes / 60
        let selectedTime = this.getformatTime({ type: 'minute', num: minutes })
        if (val.type === 'relative') {
            // 相对时间
            const target = this.relativeTimeTags.find(item => item.num === minutes)
            if (target) {
                // 非自定义时间
                val.from = target.name
                this.activeTag = target
            } else if (!minutes) {
                // 从前
                this.activeIndex = 0
                selectedTime = ['以前', this.getformatTime({ type: 'minute', num: 0 }).at(-1)]
            } else {
                // 自定义时间
                const targetIndex = this.relativeTimeTags.findIndex(item => item.name === '自定义')
                this.activeIndex = targetIndex
                this.activeTag = this.relativeTimeTags[targetIndex]
                if (minutes >= 1440 && !(minutes % 1440)) {
                    this.customTime = minutes / 1440
                    this.customUnit = 'day'
                    val.from = this.customTime + '天'
                } else if (minutes >= 60 && !(minutes % 60)) {
                    this.customTime = minutes / 60
                    this.customUnit = 'hour'
                    val.from = this.customTime + '小时'
                } else if (minutes >= 1) {
                    this.customTime = minutes
                    this.customUnit = 'minute'
                    val.from = this.customTime + '分钟'
                } else {
                    this.customTime = minutes * 60
                    this.customUnit = 'second'
                    val.from = this.customTime + '秒'
                }
                selectedTime = this.displayTime = this.getformatTime({ type: 'minute', num: minutes })
            }
        } else {
            // 绝对时间
            selectedTime = [val.from, val.to]
        }
        this.selectedTime = this.displayTime = selectedTime
        this.timerange = this.timeInfo = val
        this.selectTime()
    }
    selectTime() {
        if (this.active === 'absolute') {
            this.timerange = {
                from: this.selectedTime.at(),
                to: this.selectedTime.at(-1),
                type: 'absolute'
            }
        }
        this.$emit('change', this.selectedTime, this.timerange)
    }
    toTabMenu(item) {
        this.active = item.name
    }
    handleBur(val) {
        this.handleChange(this.customUnit)
    }
    handleChange(val) {
        const customItem = {
            type: 'minute',
            num: this.customTime
        }
        switch (val) {
            case 'day':
                customItem.num = this.customTime * 24 * 60
                break
            case 'hour':
                customItem.num = this.customTime * 60
                break
            case 'second':
                customItem.num = this.customTime / 60
                break
            default:
                customItem.num = this.customTime
                break
        }
        this.displayTime = this.getformatTime(customItem)
        const unitTarget = this.unitList.find(item => item.id === val)
        this.timeInfo = {
            minutes: customItem.num * 60,
            from: this.customTime + unitTarget.name,
            type: 'relative'
        }
    }

    confirm(type) {
        let time = this.$copy(this.displayTime)
        if (this.active === 'absolute') {
            time = this.absoluteTime.map(item => moment(item).format('YYYY-MM-DD HH:mm:ss'))
        }
        if (type === 'confirmCustomTime') {
            this.timerange = this.timeInfo
        }
        this.selectedTime = time
        this.selectTime()
        this.$refs.searchTimePopover.hideHandler()
    }
    getformatTime(item) {
        let displayTime = []
        switch (item.type) {
            case 'minute':
                displayTime = getMinutesAgoToNow(item.num)
                break
            case 'today':
                displayTime = getTodayToNow()
                break
            case 'week':
                displayTime = getCurrentWeekToNow()
                break
            case 'month':
                displayTime = getFirstDayToNow()
                break
            default:
                break
        }
        return displayTime.map(item => moment(item).format('YYYY-MM-DD HH:mm:ss'))
    }
    handleMouseenter(item) {
        if (['custom', 'before'].includes(item.type)) {
            if (item.type === 'before') {
                this.displayTime = ['以前', this.getformatTime({ type: 'minute', num: 0 }).at(-1)]
            }
            return
        }
        this.displayTime = this.getformatTime(item)
    }
    handleMouseleave() {
        this.displayTime = this.$copy(this.selectedTime)
    }
    // 点击相对时间的tag触发
    selectRelativeTime(item, index) {
        this.activeIndex = index
        this.activeTag = item
        if (item.type === 'custom') {
            this.handleChange(this.customUnit)
            return
        }
        if (item.type === 'before') {
            this.timerange = {
                from: '以前',
                range: 0,
                type: 'relative'
            }
            this.displayTime = ['以前', this.getformatTime({ type: 'minute', num: 0 }).at(-1)]
            this.confirm()
            return
        }
        this.displayTime = this.getformatTime(item)
        this.$refs.searchTimePopover.hideHandler()
        this.timerange = {
            minutes: item.num * 60,
            from: item.name,
            type: 'relative'
        }
        this.confirm()
    }
    // 获取组件的时间信息
    getSelectedTime() {
        return this.timerange
    }
    // 获取组件的查询参数timerange
    getTimeRange() {
        const selectedTime = this.getSelectedTime()
        const timerange = {
            type: selectedTime.type
        }
        const isAbsolute = selectedTime.type === 'absolute'
        if (isAbsolute) {
            timerange.from = new Date(selectedTime.from).toISOString()
            timerange.to = new Date(selectedTime.to).toISOString()
        } else {
            if (!selectedTime.minutes) {
                timerange.range = 0
            } else {
                timerange.from = selectedTime.minutes
            }
        }
        return timerange
    }
    // popover显示时
    showPopover() {
        this.active = this.timerange.type
        if (this.active === 'absolute') {
            this.absoluteTime = [this.timerange.from, this.timerange.to]
            return
        }
        const targetIndex = this.relativeTimeTags.findIndex(item => item.name === this.timerange.from)
        if (targetIndex !== -1) {
            this.activeIndex = targetIndex
            this.activeTag = this.relativeTimeTags[this.activeIndex]
        }
    }
}
</script>

<style lang='scss' scoped>
.search-time-wrapper {
    .time-selector {
        height: 32px;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #c4c6cc;
        padding: 4px 10px;
        cursor: pointer;

        .selector-begintime,
        .selector-endtime {
            width: 50%;
            display: flex;
            align-items: center;

            .label {
                font-weight: 800;
            }

            .value {
                flex: 1;
                color: #63656e;
                font-size: 12px;
            }
        }
    }
}

.model-content {
    margin-bottom: 20px;

    .tap {
        margin-bottom: 20px;
    }

    .relative-time {
        .relative-time-title {
            display: flex;
            justify-content: center;
            color: #aaa;
        }

        .relative-time-list {
            display: flex;
            flex-wrap: wrap;
            margin: 10px 0;

            li {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px 0;
                margin: 0 10px 8px 0;
                width: 80px;
                cursor: pointer;

                &:hover {
                    color: #3a84ff;
                    background: #e4f2fb;
                    border-radius: 2px;
                }
            }

            .active {
                color: #3a84ff;
                background: #e4f2fb;
                border-radius: 2px;
            }
        }

        .relative-time-selector {
            display: flex;
            align-items: center;

            .selector-value {
                width: 100px;
                margin-right: 10px;
            }

            .selector-unit {
                width: 250px;
            }
        }
    }

    .absolute-time {
        display: flex;
    }
}
/deep/.log-picker-popover {
    left: -130px !important;
}
/deep/.bk-picker-confirm {
    a {
        display: none;
    }
    .bk-picker-confirm-time {
        display: block !important;
    }
}
</style>
