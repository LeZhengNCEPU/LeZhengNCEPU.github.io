---
layout: page
permalink: /news/Data-Driven-SSO-Suppression-CSEEJPES/index.html
title: Data-Driven Subsynchronous Oscillation Suppression for Renewable Energy Integrated Power Systems Based on Koopman Operator
---

### Data-Driven Subsynchronous Oscillation Suppression for Renewable Energy Integrated Power Systems Based on Koopman Operator

> CSEE Journal of Power and Energy Systems网络首发。 <br>
> DOI: [10.17775/CSEEJPES.2024.04000](https://ieeexplore.ieee.org/document/10838276) <br>
> 更新时间：2025/1/19. <br>


#### Highlights
- <b><font color=blue>基于Koopman算符提出了包含“控制信号选取-系统状态预测-线性控制实施”全环节的纯数据驱动式控制器设计框架；</font></b>
- <b><font color=blue>构建了非线性系统全局线性表征的Koopman线性变参数预测模型；</font></b>
- <b><font color=blue>设计了一种计算高效的数据驱动式线性动态最优控制策略；</font></b>
- <b><font color=blue>所提策略能够有效、鲁棒且自适应地抑制次同步振荡，缩短至少30.65%的抑制时间。</font></b>

#### Research gap
已有的基于模型的振荡抑制控制器对模型依赖程度高且自适应差，而基于AI纯数据驱动式振荡抑制控制器存在计算效率低、可解释性不足等问题。本研究从Koopman算符理论出发，认知可再生能源并网系统的物理特性和数学本质，能够利用通用且高效的线性系统分析算法对非线性系统进行数据驱动式的辨识、预测和控制。
在设计高比例可再生能源并网系统的数据驱动式的次同步振荡抑制控制器时，本文依据系统的量测数据，着力解决以下三方面问题：
- 如何选定控制器的控制信号，以便在主导振荡模式下实现对关键状态量的靶向控制；
- 如何辨识外加输入的非线性受控系统，即如何构建一个精确的预测模型，使其充分考虑输入量对系统动力学的影响；
- 如何基于所提出的状态预测模型确定一个控制有效且计算高效的控制策略。

#### 摘要
近年来，随着可再生能源在新型电力系统中的渗透率不断提升，次同步振荡（subsynchronous oscillation, SSOs）现象在全球范围内频繁出现。由可再生能源引发的次同步振荡已成为一个突出的新型稳定问题，严重威胁着电力系统的稳定运行。本文针对高比例可再生能源并网系统，设计了一种数据驱动的振荡抑制控制器，通过对可再生能源附加动态最优控制以抑制次同步振荡。目前，振荡抑制控制器的设计面临的主要挑战在于电力系统的强非线性、高复杂性以及系统模型难以获取的特点。本文基于Koopman算符理论利用数据准确刻画系统的动态特性，并将所辨识模型应用于线性的模型预测控制（model predictive control, MPC）中。首先，通过Koopman升维线性化获得系统动态的全局线性表征，并通过分析Koopman参与因子选取振荡的关键状态量作为控制信号。随后，通过在观测空间中增广控制项，构建非线性受控系统的Koopman线性变参数（linear parameter–varying, LPV）预测模型，使其更精确地刻画受控系统的演化规律。最后，在Koopman观测空间内采用计算高效的线性MPC，实现控制器以滚动时域的方式在线计算控制指令。研究表明，本文所提出的纯数据驱动式次同步振荡抑制控制器，在各类工况条件下均展现出卓越的有效性、自适应性与鲁棒性。其控制性能稳定可靠，相较于其他控制器优势显著，能更为出色地实现抑制次同步振荡的目标。

#### Abstract
Recently, subsynchronous oscillations (SSOs) have emerged frequently worldwide, with the high penetration of renewable power generation in modern power systems. The SSO introduced by renewables has become a prominent new stability problem, seriously threatening the stable operation of systems. This paper proposes a data-driven dynamic optimal controller for renewable energy integrated power systems, to suppress SSOs with the control of renewables. The challenges of the controller design are the nonlinearity, complexity and hard accessibility of the system models. Using Koopman operator, the system dynamics are accurately extracted from data and utilized to the linear model predictive control (MPC). Firstly, the globally linear representation of the system dynamics is obtained by lifting, and the key states are selected as control signals by analyzing Koopman participation factors. Subsequently, augmented with control terms, the Koopman linear parameter-varying predictor of the nonlinear controlled system is constructed, acting as a more accurate predictor. Finally, using the computationally efficient linear MPC within the lifted Koopman space, the proposed controller computes control signals online in a moving horizon fashion. Case studies show that the proposed fully data-driven SSO suppression controller is effective, adaptive and robust in various conditions, surpassing other controllers with reliable control performance.
#### Keywords
Renewable power generation, renewable energy integrated power system, subsynchronous oscillation suppression, Koopman operator, linear parameter-varying.

<center>
<img src="/news/Data-Driven-SSO-Suppression-CSEEJPES.assets/CSEE1.png" width="80%" height="80%">
</center>

<center>
<img src="/news/Data-Driven-SSO-Suppression-CSEEJPES.assets/CSEE2.png" width="80%" height="80%">
</center>

<center>
<img src="/news/Data-Driven-SSO-Suppression-CSEEJPES.assets/CSEE3.png" width="80%" height="80%">
</center>