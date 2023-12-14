<template>
    <div class="search-container search-input">
        <bk-compose-form-item class="search-compose">
            <bk-select
                v-model="searchId"
                style="width: 120px;"
                search-placeholder="输入关键字"
                :clearable="false"
                :disabled="!selectList.length"
                @change="handleSelectChange">
                <bk-option
                    v-for="item in selectList"
                    :key="item.id"
                    :id="item.id"
                    :name="item.name">
                </bk-option>
            </bk-select>
            <bk-search-select
                clearable
                ext-cls="custom-search-select"
                :show-popover-tag-change="false"
                :style="{
                    width: (searchSelectWidth >= 200 ? searchSelectWidth : 200) + 'px'
                }"
                ref="searchSelect"
                v-bind="$attrs"
                v-model="searchValue"
                @input-focus="handleInputFocus"
                @key-enter="handleEnter"
                @change="handleChange"
                @clear="handleClear"
                @search="handleSearch">
            </bk-search-select>
            <div v-if="exactSearch"
                class="exact-search-box">
                <bk-checkbox
                    :true-value="true"
                    :false-value="false"
                    v-model="isExactSearch"
                    @change="changeExactSearch">
                    精确搜索
                </bk-checkbox>
            </div>
        </bk-compose-form-item>
        <transition name="fade">
            <div
                v-show="showSearchOption"
                class="search-option-container"
                :style="{
                    maxHeight: popoverMaxHeight + 'px'
                }">
                <bk-input
                    v-if="isSearchable"
                    :left-icon="'bk-icon icon-search'"
                    behavior="simplicity"
                    :clearable="true"
                    v-model="filterValue">
                </bk-input>
                <ul class="search-option-list">
                    <li
                        v-for="option in selectedOptions.filter(item => !filterValue.trim() || item.name.includes(filterValue.trim()))"
                        :key="option.id">
                        <div class="hide-text"
                            v-bk-overflow-tips
                            @click="handleClickOption(option)">
                            {{ option.name }}
                        </div>
                        <span
                            v-if="isMultipleAble && currentSelectedOption.includes(option.id)"
                            class="bk-icon icon-check-1" />
                    </li>
                </ul>
                <div
                    v-if="isMultipleAble"
                    class="search-option-footer">
                    <span class="footer-btn" @click="handleConfirmOption">确认</span>
                    <span class="footer-btn" @click="handleCancelOption">取消</span>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'
    @Component({
        components: {
        }
    })
    export default class SelectInput extends Vue {
        // 输入属性，用于接收下拉框的数据
        @Prop({ type: Array, default: () => [] }) data: any[] | undefined;
        // 输入属性，是否显示精确搜索
        @Prop({ type: Boolean, default: () => false }) exactSearch: boolean | undefined;
        // 输入属性，下拉弹出框最大高度
        @Prop({ type: Number, default: () => 272 }) popoverMaxHeight: number | undefined;
        // 输入属性，输入框宽度
        @Prop({ type: Number, default: () => 345 }) searchSelectWidth: number | undefined;

        // 搜索值
        searchValue: Array<any> = []
        // 当前选中的搜索项的id
        searchId: string = ''
        // 是否显示搜索选项
        showSearchOption: boolean = false
        // 当前选中的多选项
        currentSelectedOption: Array<string | number> = []
        // 是否进行精确搜索
        isExactSearch: boolean = false
        // 用户数据
        userData: any[] = []
        // 过滤值
        filterValue: string = ''
        // 定时器
        timer: any = null

        // 过滤已选中的项，生成下拉列表
        get selectList() {
            const _selectList = this.data.filter(item => !this.searchValue.find(tex => tex.id === item.id))
            this.searchId = _selectList?.at(0)?.id || ''
            return _selectList
        }
        // 获取当前选中的数据对象
        get selectedData() {
            const target = this.data.find(({ id }) => id === this.searchId) || {}
            if (target && target.type === 'objuser') {
                target.children = this.userData
                target.multiable = true
                target.searchable = true
            }
            return target
        }
        // 获取当前选中数据的子项
        get selectedOptions() {
            return this.selectedData?.children || []
        }
        // 判断当前选中数据是否支持搜索
        get isSearchable() {
            return this.selectedData?.searchable
        }
        // 判断当前选中数据是否支持多选
        get isMultipleAble() {
            return this.selectedData?.multiable
        }

        mounted() {
            this.userData = (sessionStorage.getItem('allUserData') ? JSON.parse(sessionStorage.getItem('allUserData')) : []).map(item => {
                return {
                    id: item.display,
                    name: item.displayKey
                }
            })
            const list = document.querySelector('.search-option-container')
            // 监听面板的点击事件，阻止事件冒泡
            list.addEventListener('click', function(event) {
                event.stopPropagation()
            })
            // 监听文档的点击事件，隐藏面板
            document.addEventListener('click', this.hideSearchOption)
        }
        beforeDestroy() {
            document.removeEventListener('click', this.hideSearchOption)
            clearTimeout(this.timer)
        }
        // 隐藏搜索选项面板
        hideSearchOption(event) {
            // 获取点击事件的目标元素
            const target = event.target
            // 检查点击的元素及其祖先是否包含 'search-compose' 类名
            let isSearchCompose = false
            let currentElement: any = target
            while (currentElement) {
                const { classList } = currentElement
                if (classList.contains('search-compose') || classList.contains('bk-select-dropdown-content')) {
                    isSearchCompose = true
                    break
                }
                currentElement = currentElement.parentElement
            }
            // 如果点击的元素不在 'search-compose' 类名下，隐藏面板
            if (!isSearchCompose) {
                this.showSearchOption = false
                this.currentSelectedOption = []
            }
        }
        // 处理精确搜索状态变化
        changeExactSearch() {
            this.$emit('change-exact-search', { searchValue: this.searchValue, isExactSearch: this.isExactSearch })
        }

        // 处理输入框回车事件
        handleEnter() {
            if (!this.searchValue.length) {
                return
            }
            // select框列表选完最后一个后，input框再输入内容enter时自动清空
            const lastIndex = this.data.length
            if (!this.searchId && lastIndex) {
                this.searchValue = this.searchValue.slice(0, lastIndex)
                return
            }
            // enter时处理input框的tag回显
            let lastItem = this.searchValue?.at(-1)
            const target = this.data.find(item => item.id === this.searchId)
            if (target && !lastItem?.value) {
                // 将选中项的名称与输入框的最后一项合并
                const { name, ...remainItems } = target
                lastItem = {
                    ...remainItems,
                    name: `${name}：${lastItem.name}`,
                    value: lastItem.name
                }
                // 替换输入框最后一项为合并后的项
                this.searchValue[this.searchValue.length - 1] = lastItem
            }
        }
        // 处理选项变化事件
        changeSelectOption(value) {
            this.showSearchOption = false
            const { children, ...rest } = this.selectedData
            // 构造新的选中项
            const lastItem = {
                ...rest,
                name: `${rest.name}：${value.map(v => v.name).join(',')}`,
                value: rest.multiable ? value.map(v => v.id) : value?.[0]?.id
            }
            // 在输入框的最后一项后插入新的选中项
            const index = this.searchValue.length ? this.searchValue.length - 1 : 0
            this.searchValue.splice(index, 0, lastItem)
            // 发送change事件，通知外部组件数据变化
            this.$emit('change', this.searchValue)
        }
        // 处理确认选项事件
        handleConfirmOption() {
            const { children } = this.selectedData
            if (!this.currentSelectedOption.length) return false
            // 根据当前选中的多选项，过滤出真正选中的子项
            const value = children.filter(r => this.currentSelectedOption.includes(r.id))
            // 处理选中项
            this.changeSelectOption(value)
            // 清空多选项
            this.currentSelectedOption = []
            // 清空过滤值
            this.filterValue = ''
        }
        handleCancelOption() {
            // 清空多选项
            this.currentSelectedOption = []
            // 隐藏搜索选项面板
            this.showSearchOption = false
        }
        // 处理输入框聚焦事件
        handleInputFocus() {
            const { children = [] } = this.selectedData || {}
            // 如果有子项，显示搜索选项面板
            this.showSearchOption = !!children?.length
            // 调整搜索选项面板的位置
            this.changePositionTop()
        }
        // 获取下拉展示的高度,将下拉面板的高度展示成bk-search-select的高度
        changePositionTop() {
            // 使用setTimeout确保在下一次DOM更新后执行
            this.timer = setTimeout(() => {
                // 获取当前焦点的搜索输入框元素
                const customSearchSelect: any = document.querySelector('.custom-search-select .bk-search-select.is-focus')
                if (customSearchSelect) {
                    // 获取搜索输入框的高度
                    const customSearchSelectHeight = customSearchSelect.offsetHeight
                    // 获取下拉面板的元素
                    const searchOptionContainer: any = document.querySelector('.search-option-container')
                    if (searchOptionContainer) {
                        // 将下拉面板的 top 属性设置为搜索输入框的高度加上一个像素的偏移量
                        searchOptionContainer.style.top = `${customSearchSelectHeight + 1}px`
                    }
                }
            }, 200)
        }
        handleChange() {
            this.$nextTick(() => {
                // 设置当前选中项为下拉框的第一项
                this.searchId = this.selectList?.at(0)?.id || ''
                // 发送change事件，通知外部组件数据变化
                this.$emit('change', this.searchValue)
            })
        }
        // 处理清空输入框事件
        handleClear() {
            // 调用handleChange方法，处理清空操作
            this.handleChange()
        }
        // 处理下拉框值变化事件
        handleSelectChange() {
            // 清空过滤值
            this.filterValue = ''
            // 清空多选项
            this.currentSelectedOption = []
            // 获取下拉框组件的引用
            const searchSelect: any = this.$refs.searchSelect
            // 设置输入框聚焦
            searchSelect.input.focus = true
            // 处理输入框聚焦事件
            searchSelect.handleInputFocus()
        }
        // 处理选项点击事件
        handleClickOption(option) {
            const { id } = option

            if (!this.selectedData.multiable) {
                // 如果不支持多选，直接处理选中项
                const { children } = this.selectedData
                const value = children.filter(r => r.id === id)
                this.changeSelectOption(value)
                return false
            }
            // 处理多选情况下的选项点击事件
            const index = this.currentSelectedOption.indexOf(id)
            if (index === -1) {
                // 如果当前项未选中，将其添加到选中项数组中
                this.currentSelectedOption.push(id)
            } else {
                // 如果当前项已选中，将其从选中项数组中移除
                this.currentSelectedOption.splice(index, 1)
            }
        }
        handleSearch() {
            this.$emit('search', this.searchValue)
        }
        /**
         * @param defaultVal {Object} eg: {
              selectVal: 'bk_os_name',
              inputVal: [{ name: '所在国家：中国', id: 'bk_state_name' }]
            }
         * @description 设置组件默认值
         */
        setDefaultValue(defaultVal) {
            const { selectVal, inputVal } = defaultVal
            this.searchValue = inputVal
            this.$nextTick(() => {
                this.searchId = selectVal
            })
        }
    }
</script>

<style lang="scss" scoped>
    .fade-enter-active, .fade-leave-active {
        transition: max-height 0.5s ease;
    }

    .fade-enter, .fade-leave-to {
        max-height: 0;
    }
    /deep/ .bk-compose-form-item > .search-select-wrap {
        margin-left: 0 !important;
    }
    /deep/ .search-select-wrap .bk-search-select {
        border-radius: 0 !important;
    }
    .search-container {
        position: relative;
    }
    /deep/.search-nextfix-icon {
        display: none;
    }
    .exact-search-box {
        display: inline-block;
        border: 1px solid #c4c6cc;
        padding: 5px 10px;
        height: 31px;
        border-radius: 2px;
        /deep/ .bk-checkbox-text {
            font-size: 12px;
        }
    }
    .search-option-container {
        position: absolute;
        top: 32px;
        left: 120px;
        background: #ffffff;
        box-shadow: 0 0 6px 0 #dcdee5;
        z-index: 8888;
        min-width: 200px;
        max-height: 272px;
        max-width: 344px;
        display: flex;
        flex-direction: column;
        /deep/ .bk-form-input {
            border-color: transparent transparent #c4c6cc !important;
        }
        .search-option-list {
            flex: 1;
            height: 0;
            overflow-y: auto;
            padding: 10px 0;
            li {
                height: 32px;
                line-height: 32px;
                padding: 0 10px 0 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                font-size: 12px;
                &:hover {
                    background: #f8fcff;
                    color: #3a84ff;
                }
                >div {
                    flex: 1;
                }
                span {
                    display: inline-block;
                    color: #3a84ff;
                    font-size: 20px;
                    font-weight: 700;
                }
            }
        }
        .search-option-footer {
            display: flex;
            line-height: 36px;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            pointer-events: auto;
            .footer-btn {
                flex: 1;
                text-align: center;
                border-top: 1px solid #dcdee5;
                pointer-events: auto;
                cursor: pointer;
                &:first-child {
                    border-right: 1px solid #dcdee5;
                }
                &:hover {
                    background: #f8fcff;
                    color: #3a84ff;
                }
            }
        }
    }
</style>
