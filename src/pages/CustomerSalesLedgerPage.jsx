# ================================================================
# V13 PATCH TESTING
# + MOVING / FIXED / WARPED LABEL ORIENTATION VERIFICATION
# ================================================================
#
# INPUTS:
#   /content/voxelmorph_numpy_dataset.zip
#   /content/voxelmorph_best_model (3).zip
#
# MODEL INFERENCE:
#   PATCH = 48 x 160 x 160
#   STRIDE = 48 x 80 x 80
#   NO FULL IMAGE MODEL INPUT
#
# OUTPUT:
#   /content/v13_fixed_warped_orientation_verification.zip
#
# FIGURES:
#   01_original_registration
#       Moving + moving label
#       Fixed + fixed label
#       Warped + warped label
#       Fixed + fixed solid + warped dashed
#
#   02_fixed_label_candidates
#       8 orientations of FIXED label over FIXED CBCT
#
#   03_warped_label_candidates
#       8 orientations of WARPED label over FIXED CBCT
#
#   04_fixed_vs_warped_candidates
#       FIXED remains original
#       only WARPED label orientation changes
#
# IMPORTANT:
#   Orientation candidates are ONLY for diagnosis.
#   Original .npy labels are never overwritten.
# ================================================================


# ================================================================
# 1. INSTALL
# ================================================================

import os
import sys
import subprocess


def run(cmd, cwd=None):
    print("$", " ".join(map(str, cmd)))
    subprocess.check_call(
        list(map(str, cmd)),
        cwd=cwd
    )


run([
    sys.executable,
    "-m",
    "pip",
    "install",
    "-q",
    "numpy",
    "pandas",
    "scipy",
    "scikit-image",
    "matplotlib",
    "tqdm",
    "nibabel",
    "neurite",
    "pystrum"
])


# ================================================================
# 2. IMPORTS
# ================================================================

import re
import json
import math
import shutil
import zipfile

from pathlib import Path

import numpy as np
import pandas as pd

import matplotlib.pyplot as plt

from skimage.measure import find_contours

from tqdm.auto import tqdm

from IPython.display import (
    display,
    Image as IPImage
)

import torch


# ================================================================
# 3. CONFIG
# ================================================================

DATASET_ZIP = Path(
    "/content/voxelmorph_numpy_dataset.zip"
)

MODEL_ZIP = Path(
    "/content/voxelmorph_best_model (3).zip"
)

DATASET_ROOT = Path(
    "/content/voxelmorph_numpy_dataset"
)

MODEL_ROOT = Path(
    "/content/v13_model_extract"
)

TEMP_ROOT = Path(
    "/content/_v13_dataset_extract"
)

RESULTS_ROOT = Path(
    "/content/v13_fixed_warped_orientation_verification"
)

RESULTS_ZIP = Path(
    "/content/v13_fixed_warped_orientation_verification.zip"
)


# Official VoxelMorph repo

VXM_REPO = Path(
    "/content/voxelmorph"
)

VXM_COMMIT = (
    "9bde7a270edfc19ad1c61115cb5ebd82124ee3af"
)


# ORIGINAL V13 patch

PATCH_SHAPE = (
    48,
    160,
    160
)

STRIDE = (
    48,
    80,
    80
)


# Validation + testing

EVAL_SPLITS = [
    "validation",
    "test"
]


# Useful previously inspected slices

EXTRA_Z = [
    24,
    25,
    26,
    27,
    28,
    32,
    40,
    44,
    45,
    47
]


EXPECTED_BEST_EPOCH = 34


# ================================================================
# 4. CHECK INPUT
# ================================================================

if not DATASET_ZIP.exists():

    raise FileNotFoundError(
        f"Dataset missing:\n{DATASET_ZIP}"
    )


if not MODEL_ZIP.exists():

    raise FileNotFoundError(
        f"Model missing:\n{MODEL_ZIP}"
    )


print(
    "\n"
    +
    "=" * 90
)

print(
    "V13 PATCH + FIXED/WARPED LABEL ORIENTATION TEST"
)

print(
    "=" * 90
)

print(
    "Dataset:",
    DATASET_ZIP
)

print(
    "Model:",
    MODEL_ZIP
)

print(
    "Patch:",
    PATCH_SHAPE
)

print(
    "Stride:",
    STRIDE
)

print(
    "\nNO TRAINING"
)

print(
    "NO FULL-IMAGE MODEL INPUT"
)

print(
    "NO PERMANENT LABEL FLIP/ROTATION"
)

print(
    "=" * 90
)


# ================================================================
# 5. CLEAN OLD OUTPUT
# ================================================================

for p in [

    DATASET_ROOT,
    MODEL_ROOT,
    TEMP_ROOT,
    RESULTS_ROOT

]:

    shutil.rmtree(
        p,
        ignore_errors=True
    )


DATASET_ROOT.mkdir(
    parents=True,
    exist_ok=True
)

MODEL_ROOT.mkdir(
    parents=True,
    exist_ok=True
)

TEMP_ROOT.mkdir(
    parents=True,
    exist_ok=True
)

RESULTS_ROOT.mkdir(
    parents=True,
    exist_ok=True
)


# ================================================================
# 6. EXTRACT DATASET
# ================================================================

print(
    "\n[1] Extracting prepared dataset..."
)


with zipfile.ZipFile(
    DATASET_ZIP,
    "r"
) as zf:

    zf.extractall(
        TEMP_ROOT
    )


manifest_candidates = list(
    TEMP_ROOT.rglob(
        "manifest.csv"
    )
)


if not manifest_candidates:

    raise FileNotFoundError(
        "manifest.csv not found."
    )


source_root = (
    manifest_candidates[
        0
    ].parent
)


shutil.copytree(

    source_root,

    DATASET_ROOT,

    dirs_exist_ok=True
)


shutil.rmtree(
    TEMP_ROOT,
    ignore_errors=True
)


MANIFEST_PATH = (
    DATASET_ROOT
    /
    "manifest.csv"
)


manifest = pd.read_csv(
    MANIFEST_PATH
)


print(
    "Manifest:",
    MANIFEST_PATH
)


print(
    "Columns:"
)

print(
    list(
        manifest.columns
    )
)


# ================================================================
# 7. REPAIR MANIFEST PATHS
# ================================================================

def repair_path(
    raw_path,
    pair_id,
    patient_id,
    split
):

    path = Path(
        str(
            raw_path
        )
    )


    if path.exists():

        return str(
            path
        )


    matches = list(
        DATASET_ROOT.rglob(
            path.name
        )
    )


    if not matches:

        raise FileNotFoundError(
            f"Missing prepared file: {path.name}"
        )


    temp = [

        p
        for p in matches
        if pair_id in str(p)

    ]


    if temp:

        matches = temp


    temp = [

        p
        for p in matches
        if patient_id in str(p)

    ]


    if temp:

        matches = temp


    temp = [

        p
        for p in matches
        if split in p.parts

    ]


    if temp:

        matches = temp


    return str(
        matches[
            0
        ]
    )


path_columns = [

    c
    for c in manifest.columns
    if c.endswith(
        "_path"
    )

]


for index, row in manifest.iterrows():

    pair_id = str(
        row[
            "pair_id"
        ]
    )

    patient_id = str(
        row[
            "patient_id"
        ]
    )

    split = str(
        row[
            "split"
        ]
    )


    for col in path_columns:

        if pd.isna(
            row[
                col
            ]
        ):

            continue


        manifest.at[
            index,
            col
        ] = repair_path(

            row[
                col
            ],

            pair_id,

            patient_id,

            split
        )


evaluation = manifest[

    manifest[
        "split"
    ].astype(
        str
    ).isin(
        EVAL_SPLITS
    )

].copy()


print(
    "\nEvaluation cases:"
)


print(

    evaluation[
        [
            "split",
            "patient_id",
            "pair_id"
        ]
    ].to_string(
        index=False
    )

)


# ================================================================
# 8. EXTRACT MODEL ZIP
# ================================================================

print(
    "\n[2] Extracting model..."
)


with zipfile.ZipFile(
    MODEL_ZIP,
    "r"
) as zf:

    zf.extractall(
        MODEL_ROOT
    )


checkpoint_candidates = []


for pattern in [

    "*.pt",
    "*.pth",
    "*.ckpt"

]:

    checkpoint_candidates.extend(

        MODEL_ROOT.rglob(
            pattern
        )

    )


if not checkpoint_candidates:

    raise FileNotFoundError(
        "No checkpoint found inside model ZIP."
    )


def checkpoint_score(
    path
):

    name = path.name.lower()

    score = 0


    if "best_checkpoint" in name:

        score += 100


    if "best_model" in name:

        score += 90


    if "best" in name:

        score += 70


    if "checkpoint" in name:

        score += 20


    return -score


checkpoint_candidates = sorted(

    checkpoint_candidates,

    key=checkpoint_score

)


print(
    "\nCheckpoint candidates:"
)


for p in checkpoint_candidates:

    print(
        " -",
        p
    )


CHECKPOINT_PATH = checkpoint_candidates[
    0
]


print(
    "\nSELECTED CHECKPOINT:"
)

print(
    CHECKPOINT_PATH
)


# ================================================================
# 9. OFFICIAL VOXELMORPH
# ================================================================

print(
    "\n[3] Preparing VoxelMorph..."
)


if not VXM_REPO.exists():

    run([
        "git",
        "clone",
        "-q",
        "https://github.com/voxelmorph/voxelmorph.git",
        str(
            VXM_REPO
        )
    ])


try:

    run(
        [
            "git",
            "fetch",
            "-q",
            "--all"
        ],
        cwd=VXM_REPO
    )

except Exception:

    pass


run(
    [
        "git",
        "checkout",
        "-q",
        VXM_COMMIT
    ],
    cwd=VXM_REPO
)


os.environ[
    "VXM_BACKEND"
] = "pytorch"


if str(
    VXM_REPO
) not in sys.path:

    sys.path.insert(
        0,
        str(
            VXM_REPO
        )
    )


import voxelmorph as vxm


print(
    "VoxelMorph commit:",
    VXM_COMMIT
)


# ================================================================
# 10. DEVICE
# ================================================================

DEVICE = torch.device(

    "cuda"

    if torch.cuda.is_available()

    else "cpu"
)


print(
    "\nDevice:",
    DEVICE
)


if DEVICE.type == "cuda":

    print(
        "GPU:",
        torch.cuda.get_device_name(
            0
        )
    )


# ================================================================
# 11. LOAD MODEL
# ================================================================

print(
    "\n[4] Loading V13 checkpoint..."
)


try:

    checkpoint = torch.load(

        CHECKPOINT_PATH,

        map_location="cpu",

        weights_only=False
    )

except TypeError:

    checkpoint = torch.load(

        CHECKPOINT_PATH,

        map_location="cpu"
    )


def get_epoch(
    ckpt
):

    if not isinstance(
        ckpt,
        dict
    ):

        return None


    for key in [

        "epoch",
        "best_epoch",
        "checkpoint_epoch",
        "best_model_epoch"

    ]:

        if key in ckpt:

            try:

                return int(
                    ckpt[
                        key
                    ]
                )

            except Exception:

                pass


    return None


CHECKPOINT_EPOCH = get_epoch(
    checkpoint
)


print(
    "Checkpoint epoch:",
    CHECKPOINT_EPOCH
)


if (
    CHECKPOINT_EPOCH is not None

    and

    CHECKPOINT_EPOCH
    !=
    EXPECTED_BEST_EPOCH
):

    print(
        "\nWARNING:"
    )

    print(
        f"Checkpoint says epoch={CHECKPOINT_EPOCH}."
    )

    print(
        f"Original V13 best run expected epoch≈{EXPECTED_BEST_EPOCH}."
    )

    print(
        "Testing continues, but verify model ZIP afterwards."
    )


# ================================================================
# 12. EXTRACT STATE DICT
# ================================================================

def is_tensor_dict(
    obj
):

    return (

        isinstance(
            obj,
            dict
        )

        and

        len(
            obj
        ) > 0

        and

        all(

            torch.is_tensor(
                value
            )

            for value in obj.values()

        )
    )


def get_state_dict(
    ckpt
):

    if is_tensor_dict(
        ckpt
    ):

        return ckpt


    if isinstance(
        ckpt,
        dict
    ):

        for key in [

            "model_state",
            "model_state_dict",
            "state_dict",
            "network_state_dict",
            "weights"

        ]:

            if (
                key in ckpt

                and

                is_tensor_dict(
                    ckpt[
                        key
                    ]
                )
            ):

                return ckpt[
                    key
                ]


        if (
            "model" in ckpt

            and

            is_tensor_dict(
                ckpt[
                    "model"
                ]
            )
        ):

            return ckpt[
                "model"
            ]


    return None


def remove_prefix(
    state_dict
):

    state_dict = dict(
        state_dict
    )


    for prefix in [

        "module.",
        "model.",
        "network."

    ]:

        keys = list(
            state_dict.keys()
        )


        if (
            keys

            and

            all(

                key.startswith(
                    prefix
                )

                for key in keys

            )
        ):

            state_dict = {

                key[
                    len(
                        prefix
                    ):
                ]:
                value

                for key, value
                in state_dict.items()

            }


    return state_dict


# ================================================================
# 13. BUILD MODEL
# ================================================================

def build_model():

    # ------------------------------------------------------------
    # Serialized model
    # ------------------------------------------------------------

    if isinstance(
        checkpoint,
        torch.nn.Module
    ):

        print(
            "Serialized nn.Module found."
        )

        return checkpoint


    if (

        isinstance(
            checkpoint,
            dict
        )

        and

        isinstance(
            checkpoint.get(
                "model"
            ),
            torch.nn.Module
        )

    ):

        return checkpoint[
            "model"
        ]


    # ------------------------------------------------------------
    # Try official VoxelMorph loader
    # ------------------------------------------------------------

    try:

        loaded = (
            vxm.networks.VxmDense.load(

                str(
                    CHECKPOINT_PATH
                ),

                DEVICE
            )
        )


        print(
            "Loaded using VxmDense.load()."
        )

        return loaded


    except Exception as error:

        print(
            "Official .load() not applicable:"
        )

        print(
            str(
                error
            )[
                :300
            ]
        )


    # ------------------------------------------------------------
    # State dict
    # ------------------------------------------------------------

    state_dict = get_state_dict(
        checkpoint
    )


    if state_dict is None:

        raise RuntimeError(
            "Could not find model state_dict."
        )


    state_dict = remove_prefix(
        state_dict
    )


    configs = []


    # Saved config

    if isinstance(
        checkpoint,
        dict
    ):

        for key in [

            "config",
            "model_config",
            "network_config"

        ]:

            if isinstance(
                checkpoint.get(
                    key
                ),
                dict
            ):

                configs.append(
                    (
                        key,
                        dict(
                            checkpoint[
                                key
                            ]
                        )
                    )
                )


    # Classic official VoxelMorph architecture

    configs.append(
        (
            "V13_CLASSIC",
            {

                "inshape":
                    PATCH_SHAPE,

                "nb_unet_features":
                    [
                        [
                            16,
                            32,
                            32,
                            32
                        ],

                        [
                            32,
                            32,
                            32,
                            32,
                            32,
                            16,
                            16
                        ]
                    ],

                "int_steps":
                    7,

                "int_downsize":
                    2,

                "bidir":
                    False,

                "use_probs":
                    False
            }
        )
    )


    configs.append(
        (
            "OFFICIAL_DEFAULT",
            {

                "inshape":
                    PATCH_SHAPE,

                "nb_unet_features":
                    None,

                "int_steps":
                    7,

                "int_downsize":
                    2,

                "bidir":
                    False,

                "use_probs":
                    False
            }
        )
    )


    errors = []


    allowed = {

        "inshape",
        "nb_unet_features",
        "nb_unet_levels",
        "unet_feat_mult",
        "nb_unet_conv_per_level",
        "int_steps",
        "int_downsize",
        "bidir",
        "use_probs",
        "src_feats",
        "trg_feats"

    }


    for name, config in configs:

        # If saved config lacks inshape

        config.setdefault(
            "inshape",
            PATCH_SHAPE
        )


        variants = [

            config,

            {
                k: v
                for k, v
                in config.items()
                if k in allowed
            }

        ]


        for cfg in variants:

            try:

                test_model = (
                    vxm.networks.VxmDense(
                        **cfg
                    )
                )


                test_model.load_state_dict(

                    state_dict,

                    strict=True
                )


                print(
                    "\nModel loaded using:",
                    name
                )

                print(
                    "Config:",
                    cfg
                )


                return test_model


            except Exception as error:

                errors.append(

                    (
                        name,
                        str(
                            error
                        )[
                            :400
                        ]
                    )

                )


    print(
        "\nModel loading errors:"
    )


    for name, error in errors:

        print(
            "\n",
            name,
            ":",
            error
        )


    print(
        "\nFirst checkpoint state keys:"
    )


    for key in list(
        state_dict.keys()
    )[
        :30
    ]:

        print(
            key,
            tuple(
                state_dict[
                    key
                ].shape
            )
        )


    raise RuntimeError(
        "Could not reconstruct model architecture."
    )


model = build_model()


model = model.to(
    DEVICE
)


model.eval()


print(
    "\nMODEL LOADED SUCCESSFULLY"
)


# ================================================================
# 14. PREPARE MODEL INPUT
# ================================================================

def numeric_column(
    row,
    names
):

    for name in names:

        if (
            name in row.index

            and

            pd.notna(
                row[
                    name
                ]
            )
        ):

            try:

                return (
                    float(
                        row[
                            name
                        ]
                    ),
                    name
                )

            except Exception:

                pass


    return (
        None,
        None
    )


def prepare_model_volume(
    row,
    volume,
    role
):

    volume = volume.astype(
        np.float32
    )


    current_mean = float(
        volume.mean()
    )

    current_std = float(
        volume.std()
    )


    print(
        f"{role}: stored mean={current_mean:.4f}, "
        f"std={current_std:.4f}, "
        f"min={volume.min():.4f}, "
        f"max={volume.max():.4f}"
    )


    # If already approximately normalized,
    # do NOT normalize again.

    if (
        abs(
            current_mean
        )
        <
        20

        and

        current_std
        <
        20
    ):

        print(
            f"{role}: using stored array directly."
        )

        return volume


    mean, mean_name = numeric_column(

        row,

        [
            f"{role}_mean",
            f"{role}_intensity_mean",
            f"{role}_norm_mean"
        ]
    )


    std, std_name = numeric_column(

        row,

        [
            f"{role}_std",
            f"{role}_intensity_std",
            f"{role}_norm_std"
        ]
    )


    if (
        mean is not None

        and

        std is not None

        and

        std > 1e-8
    ):

        print(
            f"{role}: normalize using "
            f"{mean_name}/{std_name}"
        )

        return (

            volume
            -
            mean

        ) / std


    print(
        f"WARNING: {role} appears unnormalized "
        "but no mean/std metadata found."
    )


    return volume


# ================================================================
# 15. PATCH STARTS
# ================================================================

def patch_starts(
    size,
    patch,
    stride
):

    if patch > size:

        raise ValueError(
            f"Patch {patch} > volume dimension {size}"
        )


    if patch == size:

        return [
            0
        ]


    starts = list(

        range(
            0,
            size - patch + 1,
            stride
        )

    )


    final_start = (
        size - patch
    )


    if starts[
        -1
    ] != final_start:

        starts.append(
            final_start
        )


    return starts


# ================================================================
# 16. BLEND WINDOW
# ================================================================

def blend_window():

    D, H, W = PATCH_SHAPE


    wz = np.ones(
        D,
        dtype=np.float32
    )


    wy = np.hanning(
        H
    ).astype(
        np.float32
    )


    wx = np.hanning(
        W
    ).astype(
        np.float32
    )


    # Avoid zero weights at global borders

    wy = np.maximum(
        wy,
        0.05
    )

    wx = np.maximum(
        wx,
        0.05
    )


    window = (

        wz[
            :,
            None,
            None
        ]

        *

        wy[
            None,
            :,
            None
        ]

        *

        wx[
            None,
            None,
            :
        ]

    )


    return window.astype(
        np.float32
    )


# ================================================================
# 17. ONE PATCH FLOW
# ================================================================

@torch.no_grad()
def get_patch_flow(
    moving_patch,
    fixed_patch
):

    moving_tensor = torch.from_numpy(

        moving_patch[
            None,
            None
        ]

    ).float().to(
        DEVICE
    )


    fixed_tensor = torch.from_numpy(

        fixed_patch[
            None,
            None
        ]

    ).float().to(
        DEVICE
    )


    try:

        output = model(

            moving_tensor,

            fixed_tensor,

            registration=True
        )


    except TypeError:

        output = model(

            moving_tensor,

            fixed_tensor
        )


    if not isinstance(
        output,
        (
            tuple,
            list
        )
    ):

        raise RuntimeError(
            "Expected model output tuple/list."
        )


    flow = None


    # Find 3-channel displacement field

    for item in reversed(
        output
    ):

        if (

            torch.is_tensor(
                item
            )

            and

            item.ndim == 5

            and

            item.shape[
                1
            ] == 3

        ):

            flow = item

            break


    if flow is None:

        print(
            "Output shapes:"
        )

        for item in output:

            if torch.is_tensor(
                item
            ):

                print(
                    tuple(
                        item.shape
                    )
                )


        raise RuntimeError(
            "3-channel flow not found."
        )


    flow = (

        flow[
            0
        ]

        .detach()

        .float()

        .cpu()

        .numpy()

    )


    if tuple(
        flow.shape[
            1:
        ]
    ) != PATCH_SHAPE:

        raise RuntimeError(

            f"Flow shape={flow.shape}; "
            f"expected (3,{PATCH_SHAPE})"

        )


    return flow


# ================================================================
# 18. PATCHWISE FULL FLOW
# ================================================================

@torch.no_grad()
def patch_inference(
    moving,
    fixed
):

    D, H, W = moving.shape


    pD, pH, pW = PATCH_SHAPE


    sD, sH, sW = STRIDE


    z_starts = patch_starts(
        D,
        pD,
        sD
    )


    y_starts = patch_starts(
        H,
        pH,
        sH
    )


    x_starts = patch_starts(
        W,
        pW,
        sW
    )


    print(
        "Z starts:",
        z_starts
    )

    print(
        "Y starts:",
        y_starts
    )

    print(
        "X starts:",
        x_starts
    )


    total = (

        len(
            z_starts
        )

        *

        len(
            y_starts
        )

        *

        len(
            x_starts
        )

    )


    print(
        "TOTAL PATCHES:",
        total
    )


    weights = blend_window()


    flow_sum = np.zeros(

        (
            3,
            D,
            H,
            W
        ),

        dtype=np.float32
    )


    weight_sum = np.zeros(

        (
            D,
            H,
            W
        ),

        dtype=np.float32
    )


    progress = tqdm(

        total=total,

        desc="V13 patches"
    )


    for z in z_starts:

        for y in y_starts:

            for x in x_starts:


                moving_patch = moving[

                    z:
                    z + pD,

                    y:
                    y + pH,

                    x:
                    x + pW

                ]


                fixed_patch = fixed[

                    z:
                    z + pD,

                    y:
                    y + pH,

                    x:
                    x + pW

                ]


                flow = get_patch_flow(

                    moving_patch,

                    fixed_patch
                )


                flow_sum[

                    :,

                    z:
                    z + pD,

                    y:
                    y + pH,

                    x:
                    x + pW

                ] += (

                    flow

                    *

                    weights[
                        None
                    ]

                )


                weight_sum[

                    z:
                    z + pD,

                    y:
                    y + pH,

                    x:
                    x + pW

                ] += weights


                progress.update(
                    1
                )


    progress.close()


    if np.any(
        weight_sum <= 0
    ):

        raise RuntimeError(
            "Zero blend weights found."
        )


    full_flow = (

        flow_sum

        /

        weight_sum[
            None
        ]

    )


    return full_flow.astype(
        np.float32
    )


# ================================================================
# 19. FULL WARP AFTER PATCH FLOW BLENDING
# ================================================================

@torch.no_grad()
def warp_full(
    moving_image,
    moving_label,
    flow
):

    shape = tuple(
        moving_image.shape
    )


    image_transformer = (

        vxm.layers.SpatialTransformer(

            shape,

            mode="bilinear"
        )

        .to(
            DEVICE
        )

    )


    label_transformer = (

        vxm.layers.SpatialTransformer(

            shape,

            mode="nearest"
        )

        .to(
            DEVICE
        )

    )


    image_tensor = torch.from_numpy(

        moving_image[
            None,
            None
        ].astype(
            np.float32
        )

    ).to(
        DEVICE
    )


    label_tensor = torch.from_numpy(

        moving_label[
            None,
            None
        ].astype(
            np.float32
        )

    ).to(
        DEVICE
    )


    flow_tensor = torch.from_numpy(

        flow[
            None
        ].astype(
            np.float32
        )

    ).to(
        DEVICE
    )


    warped_image = image_transformer(

        image_tensor,

        flow_tensor

    )[
        0,
        0
    ].cpu().numpy()


    warped_label = label_transformer(

        label_tensor,

        flow_tensor

    )[
        0,
        0
    ].cpu().numpy()


    warped_label = np.rint(

        warped_label

    ).astype(
        np.uint8
    )


    return (

        warped_image,

        warped_label
    )


# ================================================================
# 20. DICE
# ================================================================

def dice(
    a,
    b
):

    a = np.asarray(
        a
    ).astype(
        bool
    )


    b = np.asarray(
        b
    ).astype(
        bool
    )


    denominator = (

        a.sum()

        +

        b.sum()

    )


    if denominator == 0:

        return 1.0


    return float(

        2

        *

        np.logical_and(
            a,
            b
        ).sum()

        /

        denominator

    )


def lung_dice(
    fixed_label,
    warped_label,
    class_id
):

    return dice(

        fixed_label
        ==
        class_id,

        warped_label
        ==
        class_id

    )


# ================================================================
# 21. ORIENTATION CANDIDATES
# ================================================================

def original(
    x
):

    return x.copy()


def flip_tb(
    x
):

    return np.flip(

        x,

        axis=-2

    ).copy()


def flip_lr(
    x
):

    return np.flip(

        x,

        axis=-1

    ).copy()


def rotate_90(
    x
):

    return np.rot90(

        x,

        1,

        axes=(
            -2,
            -1
        )

    ).copy()


def rotate_180(
    x
):

    return np.rot90(

        x,

        2,

        axes=(
            -2,
            -1
        )

    ).copy()


def rotate_270(
    x
):

    return np.rot90(

        x,

        3,

        axes=(
            -2,
            -1
        )

    ).copy()


def transpose_xy(
    x
):

    return np.swapaxes(

        x,

        -2,

        -1

    ).copy()


def anti_transpose(
    x
):

    x = np.swapaxes(

        x,

        -2,

        -1

    )


    x = np.flip(

        x,

        axis=-2

    )


    x = np.flip(

        x,

        axis=-1

    )


    return x.copy()


TRANSFORMS = {

    "ORIGINAL":
        original,

    "FLIP_TOP_BOTTOM":
        flip_tb,

    "FLIP_LEFT_RIGHT":
        flip_lr,

    "ROTATE_90":
        rotate_90,

    "ROTATE_180":
        rotate_180,

    "ROTATE_270":
        rotate_270,

    "TRANSPOSE":
        transpose_xy,

    "ANTI_TRANSPOSE":
        anti_transpose

}


# ================================================================
# 22. DISPLAY NORMALIZATION
# ================================================================

def display_normalize(
    image
):

    image = image.astype(
        np.float32
    )


    valid = image[
        np.isfinite(
            image
        )
    ]


    if valid.size == 0:

        return np.zeros_like(
            image
        )


    low, high = np.percentile(

        valid,

        [
            1,
            99
        ]

    )


    if high <= low:

        high = low + 1


    return np.clip(

        (
            image
            -
            low
        )

        /

        (
            high
            -
            low
        ),

        0,
        1
    )


# ================================================================
# 23. DRAW FIXED CONTOUR
# ================================================================

def draw_fixed(
    ax,
    label,
    linestyle="-",
    linewidth=2
):

    left = (
        label == 1
    )


    right = (
        label == 2
    )


    if np.any(
        left
    ):

        for contour in find_contours(

            left.astype(
                np.float32
            ),

            0.5

        ):

            ax.plot(

                contour[
                    :,
                    1
                ],

                contour[
                    :,
                    0
                ],

                color="magenta",

                linestyle=linestyle,

                linewidth=linewidth
            )


    if np.any(
        right
    ):

        for contour in find_contours(

            right.astype(
                np.float32
            ),

            0.5

        ):

            ax.plot(

                contour[
                    :,
                    1
                ],

                contour[
                    :,
                    0
                ],

                color="cyan",

                linestyle=linestyle,

                linewidth=linewidth
            )


# ================================================================
# 24. DRAW WARPED CONTOUR
# ================================================================

def draw_warped(
    ax,
    label,
    linestyle="--",
    linewidth=2
):

    left = (
        label == 1
    )


    right = (
        label == 2
    )


    if np.any(
        left
    ):

        for contour in find_contours(

            left.astype(
                np.float32
            ),

            0.5

        ):

            ax.plot(

                contour[
                    :,
                    1
                ],

                contour[
                    :,
                    0
                ],

                color="yellow",

                linestyle=linestyle,

                linewidth=linewidth
            )


    if np.any(
        right
    ):

        for contour in find_contours(

            right.astype(
                np.float32
            ),

            0.5

        ):

            ax.plot(

                contour[
                    :,
                    1
                ],

                contour[
                    :,
                    0
                ],

                color="lime",

                linestyle=linestyle,

                linewidth=linewidth
            )


# ================================================================
# 25. SELECT IMPORTANT SLICES
# ================================================================

def select_slices(
    fixed_label,
    warped_label
):

    mask = np.logical_or(

        fixed_label > 0,

        warped_label > 0

    )


    area = mask.sum(
        axis=(
            1,
            2
        )
    )


    present = np.where(
        area > 0
    )[
        0
    ]


    if len(
        present
    ) == 0:

        return [
            fixed_label.shape[
                0
            ] // 2
        ]


    selected = set()


    selected.add(
        int(
            present[
                0
            ]
        )
    )


    selected.add(
        int(
            present[
                -1
            ]
        )
    )


    selected.add(
        int(
            np.argmax(
                area
            )
        )
    )


    for fraction in [

        0.25,
        0.5,
        0.75

    ]:

        index = int(

            round(

                (
                    len(
                        present
                    )
                    -
                    1
                )

                *

                fraction

            )

        )


        selected.add(

            int(
                present[
                    index
                ]
            )

        )


    for z in EXTRA_Z:

        if (

            0
            <=
            z
            <
            fixed_label.shape[
                0
            ]

        ):

            if (

                np.any(
                    fixed_label[
                        z
                    ]
                    >
                    0
                )

                or

                np.any(
                    warped_label[
                        z
                    ]
                    >
                    0
                )

            ):

                selected.add(
                    z
                )


    return sorted(
        selected
    )


# ================================================================
# 26. ORIGINAL 4-PANEL FIGURE
# ================================================================

def save_original_figure(

    moving_image,
    moving_label,

    fixed_image,
    fixed_label,

    warped_image,
    warped_label,

    z,
    title,
    output_path

):

    fig, axes = plt.subplots(

        2,
        2,

        figsize=(
            14,
            13
        )
    )


    # MOVING

    axes[
        0,
        0
    ].imshow(

        display_normalize(
            moving_image[
                z
            ]
        ),

        cmap="gray",

        origin="upper"
    )


    draw_fixed(

        axes[
            0,
            0
        ],

        moving_label[
            z
        ]
    )


    axes[
        0,
        0
    ].set_title(

        "MOVING CT + MOVING LABEL\n"
        "magenta=left | cyan=right"

    )


    # FIXED

    axes[
        0,
        1
    ].imshow(

        display_normalize(
            fixed_image[
                z
            ]
        ),

        cmap="gray",

        origin="upper"
    )


    draw_fixed(

        axes[
            0,
            1
        ],

        fixed_label[
            z
        ]
    )


    axes[
        0,
        1
    ].set_title(

        "FIXED CBCT + FIXED LABEL\n"
        "magenta=left | cyan=right"

    )


    # WARPED

    axes[
        1,
        0
    ].imshow(

        display_normalize(
            warped_image[
                z
            ]
        ),

        cmap="gray",

        origin="upper"
    )


    draw_warped(

        axes[
            1,
            0
        ],

        warped_label[
            z
        ],

        linestyle="-"
    )


    axes[
        1,
        0
    ].set_title(

        "WARPED CT + WARPED MOVING LABEL\n"
        "yellow=left | lime=right"

    )


    # FIXED + WARPED

    axes[
        1,
        1
    ].imshow(

        display_normalize(
            fixed_image[
                z
            ]
        ),

        cmap="gray",

        origin="upper"
    )


    draw_fixed(

        axes[
            1,
            1
        ],

        fixed_label[
            z
        ],

        linestyle="-",

        linewidth=2.2
    )


    draw_warped(

        axes[
            1,
            1
        ],

        warped_label[
            z
        ],

        linestyle="--",

        linewidth=2
    )


    axes[
        1,
        1
    ].set_title(

        "FIXED CBCT + BOTH LABELS\n"
        "fixed=solid magenta/cyan\n"
        "warped=dashed yellow/lime"

    )


    for ax in axes.flat:

        ax.axis(
            "off"
        )


    fig.suptitle(

        f"{title} | z={z}\n"
        "ORIGINAL — NO FLIP / ROTATION",

        fontsize=14
    )


    fig.tight_layout()


    fig.savefig(

        output_path,

        dpi=160,

        bbox_inches="tight"
    )


    plt.close(
        fig
    )


# ================================================================
# 27. FIXED LABEL CANDIDATES
# ================================================================

def save_fixed_candidates(

    fixed_image,
    fixed_label,

    z,
    title,
    output_path

):

    fig, axes = plt.subplots(

        2,
        4,

        figsize=(
            20,
            10
        )
    )


    axes = axes.flatten()


    for ax, (
        name,
        transform
    ) in zip(

        axes,

        TRANSFORMS.items()

    ):

        candidate = transform(

            fixed_label[
                z
            ]

        )


        ax.imshow(

            display_normalize(
                fixed_image[
                    z
                ]
            ),

            cmap="gray",

            origin="upper"
        )


        draw_fixed(

            ax,

            candidate
        )


        ax.set_title(
            name
        )


        ax.axis(
            "off"
        )


    fig.suptitle(

        f"{title} | z={z}\n"
        "FIXED LABEL ORIENTATION CANDIDATES",

        fontsize=14
    )


    fig.tight_layout()


    fig.savefig(

        output_path,

        dpi=150,

        bbox_inches="tight"
    )


    plt.close(
        fig
    )


# ================================================================
# 28. WARPED LABEL CANDIDATES
# ================================================================

def save_warped_candidates(

    fixed_image,
    warped_label,

    z,
    title,
    output_path

):

    fig, axes = plt.subplots(

        2,
        4,

        figsize=(
            20,
            10
        )
    )


    axes = axes.flatten()


    for ax, (
        name,
        transform
    ) in zip(

        axes,

        TRANSFORMS.items()

    ):

        candidate = transform(

            warped_label[
                z
            ]

        )


        ax.imshow(

            display_normalize(
                fixed_image[
                    z
                ]
            ),

            cmap="gray",

            origin="upper"
        )


        draw_warped(

            ax,

            candidate,

            linestyle="-"
        )


        ax.set_title(
            name
        )


        ax.axis(
            "off"
        )


    fig.suptitle(

        f"{title} | z={z}\n"
        "WARPED MOVING LABEL ORIENTATION CANDIDATES "
        "OVER FIXED CBCT",

        fontsize=14
    )


    fig.tight_layout()


    fig.savefig(

        output_path,

        dpi=150,

        bbox_inches="tight"
    )


    plt.close(
        fig
    )


# ================================================================
# 29. FIXED ORIGINAL + WARPED CANDIDATES
# ================================================================

def save_fixed_vs_warped_candidates(

    fixed_image,
    fixed_label,
    warped_label,

    z,
    title,
    output_path

):

    fig, axes = plt.subplots(

        2,
        4,

        figsize=(
            20,
            10
        )
    )


    axes = axes.flatten()


    for ax, (
        name,
        transform
    ) in zip(

        axes,

        TRANSFORMS.items()

    ):

        warped_candidate = transform(

            warped_label[
                z
            ]

        )


        ax.imshow(

            display_normalize(
                fixed_image[
                    z
                ]
            ),

            cmap="gray",

            origin="upper"
        )


        # FIXED stays ORIGINAL

        draw_fixed(

            ax,

            fixed_label[
                z
            ],

            linestyle="-",

            linewidth=2.2
        )


        # Only WARPED changes

        draw_warped(

            ax,

            warped_candidate,

            linestyle="--",

            linewidth=2
        )


        ax.set_title(
            name
        )


        ax.axis(
            "off"
        )


    fig.suptitle(

        f"{title} | z={z}\n"
        "FIXED ORIGINAL = solid magenta/cyan | "
        "WARPED candidate = dashed yellow/lime",

        fontsize=14
    )


    fig.tight_layout()


    fig.savefig(

        output_path,

        dpi=150,

        bbox_inches="tight"
    )


    plt.close(
        fig
    )


# ================================================================
# 30. ORIENTATION DICE TEST
# ================================================================

def orientation_dice_table(

    fixed_label,
    warped_label,

    split,
    patient_id,
    pair_id

):

    rows = []


    for name, transform in TRANSFORMS.items():

        warped_candidate = transform(
            warped_label
        )


        left = lung_dice(

            fixed_label,

            warped_candidate,

            1
        )


        right = lung_dice(

            fixed_label,

            warped_candidate,

            2
        )


        rows.append(
            {

                "split":
                    split,

                "patient_id":
                    patient_id,

                "pair_id":
                    pair_id,

                "transform":
                    name,

                "left_dice":
                    left,

                "right_dice":
                    right,

                "mean_dice":
                    (
                        left
                        +
                        right
                    )
                    /
                    2
            }
        )


    return pd.DataFrame(
        rows
    )


# ================================================================
# 31. MAIN TESTING LOOP
# ================================================================

all_metrics = []

all_orientation_results = []

all_original_images = []

all_compare_images = []


print(
    "\n[5] Starting validation/test..."
)


for _, row in evaluation.iterrows():


    split = str(
        row[
            "split"
        ]
    )


    patient_id = str(
        row[
            "patient_id"
        ]
    )


    pair_id = str(
        row[
            "pair_id"
        ]
    )


    print(
        "\n"
        +
        "=" * 90
    )

    print(
        split.upper(),
        "|",
        pair_id
    )

    print(
        "=" * 90
    )


    moving_image = np.load(

        row[
            "moving_path"
        ]

    ).astype(
        np.float32
    )


    fixed_image = np.load(

        row[
            "fixed_path"
        ]

    ).astype(
        np.float32
    )


    moving_label = np.load(

        row[
            "moving_label_path"
        ]

    ).astype(
        np.uint8
    )


    fixed_label = np.load(

        row[
            "fixed_label_path"
        ]

    ).astype(
        np.uint8
    )


    print(
        "Moving shape:",
        moving_image.shape
    )


    print(
        "Fixed shape:",
        fixed_image.shape
    )


    print(
        "Moving label:",
        np.unique(
            moving_label
        )
    )


    print(
        "Fixed label:",
        np.unique(
            fixed_label
        )
    )


    # ------------------------------------------------------------
    # MODEL INPUT
    # ------------------------------------------------------------

    moving_model = prepare_model_volume(

        row,

        moving_image,

        "moving"
    )


    fixed_model = prepare_model_volume(

        row,

        fixed_image,

        "fixed"
    )


    # ------------------------------------------------------------
    # PATCH INFERENCE
    # ------------------------------------------------------------

    full_flow = patch_inference(

        moving_model,

        fixed_model
    )


    print(
        "Full flow shape:",
        full_flow.shape
    )


    # ------------------------------------------------------------
    # WARP MOVING IMAGE + MOVING LABEL
    # ------------------------------------------------------------

    warped_image, warped_label = warp_full(

        moving_image,

        moving_label,

        full_flow
    )


    print(
        "Warped label unique:",
        np.unique(
            warped_label
        )
    )


    # ------------------------------------------------------------
    # ORIGINAL DICE
    # ------------------------------------------------------------

    left_dice = lung_dice(

        fixed_label,

        warped_label,

        1
    )


    right_dice = lung_dice(

        fixed_label,

        warped_label,

        2
    )


    mean_dice = (

        left_dice

        +

        right_dice

    ) / 2


    print(
        "\nORIGINAL — NO TRANSFORM"
    )


    print(
        f"Left Dice : {left_dice:.6f}"
    )


    print(
        f"Right Dice: {right_dice:.6f}"
    )


    print(
        f"Mean Dice : {mean_dice:.6f}"
    )


    all_metrics.append(
        {

            "split":
                split,

            "patient_id":
                patient_id,

            "pair_id":
                pair_id,

            "checkpoint_epoch":
                CHECKPOINT_EPOCH,

            "left_dice_original":
                left_dice,

            "right_dice_original":
                right_dice,

            "mean_dice_original":
                mean_dice,

            "flow_mean_abs_voxel":
                float(
                    np.mean(
                        np.abs(
                            full_flow
                        )
                    )
                ),

            "flow_max_abs_voxel":
                float(
                    np.max(
                        np.abs(
                            full_flow
                        )
                    )
                )
        }
    )


    # ------------------------------------------------------------
    # CASE DIRECTORY
    # ------------------------------------------------------------

    case_dir = (

        RESULTS_ROOT

        /

        split

        /

        pair_id

    )


    original_dir = (

        case_dir

        /

        "01_original_registration"

    )


    fixed_candidate_dir = (

        case_dir

        /

        "02_fixed_label_candidates"

    )


    warped_candidate_dir = (

        case_dir

        /

        "03_warped_label_candidates"

    )


    compare_dir = (

        case_dir

        /

        "04_fixed_vs_warped_candidates"

    )


    for directory in [

        original_dir,
        fixed_candidate_dir,
        warped_candidate_dir,
        compare_dir

    ]:

        directory.mkdir(

            parents=True,

            exist_ok=True
        )


    # Save ORIGINAL warped label

    np.save(

        case_dir
        /
        "warped_moving_label_original.npy",

        warped_label
    )


    # ------------------------------------------------------------
    # ORIENTATION DICE TABLE
    # ------------------------------------------------------------

    orientation_df = orientation_dice_table(

        fixed_label,

        warped_label,

        split,

        patient_id,

        pair_id
    )


    orientation_df.to_csv(

        case_dir
        /
        "orientation_dice_candidates.csv",

        index=False
    )


    all_orientation_results.append(
        orientation_df
    )


    print(
        "\nWARPED ORIENTATION CANDIDATE DICE:"
    )


    print(

        orientation_df.sort_values(

            "mean_dice",

            ascending=False

        ).to_string(
            index=False
        )

    )


    # ------------------------------------------------------------
    # SELECT SLICES
    # ------------------------------------------------------------

    slices = select_slices(

        fixed_label,

        warped_label
    )


    print(
        "\nDiagnostic Z slices:",
        slices
    )


    title = (

        f"{split.upper()} | {pair_id}"

    )


    # ------------------------------------------------------------
    # CREATE FIGURES
    # ------------------------------------------------------------

    for z in slices:


        # ORIGINAL

        original_path = (

            original_dir

            /

            f"z_{z:03d}_original.png"

        )


        save_original_figure(

            moving_image,
            moving_label,

            fixed_image,
            fixed_label,

            warped_image,
            warped_label,

            z,

            title,

            original_path
        )


        all_original_images.append(
            original_path
        )


        # FIXED candidates

        fixed_path = (

            fixed_candidate_dir

            /

            f"z_{z:03d}_fixed_candidates.png"

        )


        save_fixed_candidates(

            fixed_image,

            fixed_label,

            z,

            title,

            fixed_path
        )


        # WARPED candidates

        warped_path = (

            warped_candidate_dir

            /

            f"z_{z:03d}_warped_candidates.png"

        )


        save_warped_candidates(

            fixed_image,

            warped_label,

            z,

            title,

            warped_path
        )


        # FIXED ORIGINAL + WARPED candidates

        comparison_path = (

            compare_dir

            /

            f"z_{z:03d}_fixed_vs_warped.png"

        )


        save_fixed_vs_warped_candidates(

            fixed_image,

            fixed_label,

            warped_label,

            z,

            title,

            comparison_path
        )


        all_compare_images.append(
            comparison_path
        )


    # ------------------------------------------------------------
    # MEMORY
    # ------------------------------------------------------------

    del full_flow

    del warped_image


    if DEVICE.type == "cuda":

        torch.cuda.empty_cache()


# ================================================================
# 32. SAVE ORIGINAL METRICS
# ================================================================

metrics_df = pd.DataFrame(
    all_metrics
)


METRICS_CSV = (

    RESULTS_ROOT

    /

    "original_patch_registration_metrics.csv"

)


metrics_df.to_csv(

    METRICS_CSV,

    index=False
)


print(
    "\n"
    +
    "=" * 90
)

print(
    "ORIGINAL PATCH REGISTRATION METRICS"
)

print(
    "=" * 90
)


display(
    metrics_df
)


# ================================================================
# 33. SAVE ALL ORIENTATION RESULTS
# ================================================================

orientation_all_df = pd.concat(

    all_orientation_results,

    ignore_index=True
)


ORIENTATION_CSV = (

    RESULTS_ROOT

    /

    "all_orientation_dice_candidates.csv"

)


orientation_all_df.to_csv(

    ORIENTATION_CSV,

    index=False
)


# ================================================================
# 34. BEST TRANSFORM PER CASE
# ================================================================

best_rows = []


for (

    split,
    patient_id,
    pair_id

), group in orientation_all_df.groupby(

    [
        "split",
        "patient_id",
        "pair_id"
    ]

):


    ranked = group.sort_values(

        "mean_dice",

        ascending=False
    )


    best = ranked.iloc[
        0
    ]


    original_row = group[

        group[
            "transform"
        ]
        ==
        "ORIGINAL"

    ].iloc[
        0
    ]


    best_rows.append(
        {

            "split":
                split,

            "patient_id":
                patient_id,

            "pair_id":
                pair_id,

            "best_candidate":
                best[
                    "transform"
                ],

            "best_left_dice":
                best[
                    "left_dice"
                ],

            "best_right_dice":
                best[
                    "right_dice"
                ],

            "best_mean_dice":
                best[
                    "mean_dice"
                ],

            "original_mean_dice":
                original_row[
                    "mean_dice"
                ],

            "difference":
                (
                    best[
                        "mean_dice"
                    ]

                    -

                    original_row[
                        "mean_dice"
                    ]
                )
        }
    )


best_df = pd.DataFrame(
    best_rows
)


BEST_CSV = (

    RESULTS_ROOT

    /

    "best_orientation_candidate_per_case.csv"

)


best_df.to_csv(

    BEST_CSV,

    index=False
)


print(
    "\n"
    +
    "=" * 90
)

print(
    "BEST WARPED-LABEL ORIENTATION CANDIDATE"
)

print(
    "=" * 90
)


display(
    best_df
)


# ================================================================
# 35. CREATE QUICK MONTAGE
# ================================================================

MONTAGE_PATH = (

    RESULTS_ROOT

    /

    "FIXED_WARPED_ORIGINAL_QC_MONTAGE.png"

)


montage_paths = all_original_images[
    :16
]


if montage_paths:


    loaded = [

        plt.imread(
            path
        )

        for path in montage_paths

    ]


    fig, axes = plt.subplots(

        len(
            loaded
        ),

        1,

        figsize=(

            16,

            len(
                loaded
            )
            *
            12

        )
    )


    if len(
        loaded
    ) == 1:

        axes = [
            axes
        ]


    for ax, image, path in zip(

        axes,

        loaded,

        montage_paths

    ):

        ax.imshow(
            image
        )


        ax.set_title(

            f"{path.parent.parent.name} | "
            f"{path.stem}"

        )


        ax.axis(
            "off"
        )


    fig.tight_layout()


    fig.savefig(

        MONTAGE_PATH,

        dpi=90,

        bbox_inches="tight"
    )


    plt.close(
        fig
    )


# ================================================================
# 36. REPORT
# ================================================================

REPORT_PATH = (

    RESULTS_ROOT

    /

    "ORIENTATION_VERIFICATION_REPORT.txt"

)


report = []


report.append(

    "V13 PATCH + FIXED/WARPED LABEL ORIENTATION VERIFICATION"

)


report.append(

    "=" * 90

)


report.append(
    ""
)


report.append(

    f"Dataset: {DATASET_ZIP}"

)


report.append(

    f"Model: {MODEL_ZIP}"

)


report.append(

    f"Checkpoint: {CHECKPOINT_PATH}"

)


report.append(

    f"Checkpoint epoch: {CHECKPOINT_EPOCH}"

)


report.append(

    f"Patch: {PATCH_SHAPE}"

)


report.append(

    f"Stride: {STRIDE}"

)


report.append(
    ""
)


report.append(

    "NO TRAINING."

)


report.append(

    "NO FULL-IMAGE MODEL INPUT."

)


report.append(

    "Patch flows were blended to a full deformation field."

)


report.append(

    "Moving labels were warped using nearest-neighbour interpolation."

)


report.append(
    ""
)


report.append(

    "FIXED contour:"
)


report.append(

    "  Left = magenta solid"

)


report.append(

    "  Right = cyan solid"

)


report.append(

    "WARPED contour:"
)


report.append(

    "  Left = yellow dashed"

)


report.append(

    "  Right = lime dashed"

)


report.append(
    ""
)


report.append(

    "IMPORTANT:"
)


report.append(

    "Orientation candidates are diagnostic only."

)


report.append(

    "No label is permanently flipped or rotated."

)


report.append(
    ""
)


report.append(

    "ORIGINAL METRICS:"

)


report.append(

    metrics_df.to_string(
        index=False
    )

)


report.append(
    ""
)


report.append(

    "BEST ORIENTATION CANDIDATES:"

)


report.append(

    best_df.to_string(
        index=False
    )

)


REPORT_PATH.write_text(

    "\n".join(
        report
    ),

    encoding="utf-8"
)


# ================================================================
# 37. ZIP OUTPUT
# ================================================================

if RESULTS_ZIP.exists():

    RESULTS_ZIP.unlink()


with zipfile.ZipFile(

    RESULTS_ZIP,

    "w",

    compression=zipfile.ZIP_DEFLATED

) as zf:


    for file in RESULTS_ROOT.rglob(
        "*"
    ):

        if file.is_file():

            zf.write(

                file,

                file.relative_to(
                    RESULTS_ROOT
                )
            )


# ================================================================
# 38. SHOW IMPORTANT IMAGES
# ================================================================

print(
    "\n"
    +
    "=" * 90
)

print(
    "TEST COMPLETE"
)

print(
    "=" * 90
)


print(
    "\nMetrics:"
)

print(
    METRICS_CSV
)


print(
    "\nOrientation table:"
)

print(
    ORIENTATION_CSV
)


print(
    "\nBest candidate table:"
)

print(
    BEST_CSV
)


print(
    "\nRESULT ZIP:"
)

print(
    RESULTS_ZIP
)


# Original comparison

print(
    "\nFIRST ORIGINAL MOVING/FIXED/WARPED FIGURES:"
)


for image_path in all_original_images[
    :6
]:

    print(
        image_path
    )


    display(

        IPImage(
            filename=str(
                image_path
            )
        )

    )


# Most important orientation figures

print(
    "\nFIRST FIXED-vs-WARPED ORIENTATION FIGURES:"
)


for image_path in all_compare_images[
    :6
]:

    print(
        image_path
    )


    display(

        IPImage(
            filename=str(
                image_path
            )
        )

    )


# ================================================================
# 39. AUTO DOWNLOAD
# ================================================================

try:

    from google.colab import files


    files.download(

        str(
            RESULTS_ZIP
        )

    )


except Exception as error:

    print(
        "Auto download failed:",
        error
    )


    print(
        "Manual download path:"
    )


    print(
        RESULTS_ZIP
    )


print(
    "\nDONE."
)
